import { NextResponse } from "next/server"
import type Stripe from "stripe"

import { getStripe, getStripeWebhookSecret } from "@/lib/stripe"
import {
  claimWebhookEvent,
  findUserByStripeCustomerId,
  findUserByStripeSubscriptionId,
  findUserById,
  getUserIdFromMetadata,
  isSubscriptionRole,
  markWebhookEventProcessed,
  recordSuccessfulPayment,
  releaseWebhookEvent,
  retrieveStripeSubscription,
  setUserSubscriptionState,
  type SubscriptionRole,
} from "@/lib/subscription"

export const runtime = "nodejs"

const ACTIVE_SUBSCRIPTION_STATUSES = ["active", "trialing"]
const TERMINAL_SUBSCRIPTION_STATUSES = ["canceled", "unpaid", "incomplete_expired"]

interface VerifiedUser {
  id: string
  email: string
  role: SubscriptionRole
}

function getId(value: unknown): string | null {
  if (!value) return null
  if (typeof value === "string") return value

  if (typeof value === "object" && value !== null && "id" in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === "string") return id
  }

  return null
}

function isActiveSubscriptionStatus(status: string) {
  return ACTIVE_SUBSCRIPTION_STATUSES.includes(status)
}

function isTerminalSubscriptionStatus(status: string) {
  return TERMINAL_SUBSCRIPTION_STATUSES.includes(status)
}

/** Stripe v23 exposes the subscription under invoice.parent; older API versions used a top-level field. */
function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const parentSubscription = invoice.parent?.subscription_details?.subscription
  const legacySubscription = (invoice as Stripe.Invoice & { subscription?: unknown })
    .subscription

  return getId(parentSubscription) ?? getId(legacySubscription)
}

/** Stripe v23 exposes PaymentIntents through invoice.payments; older API versions used a top-level field. */
function getInvoicePaymentIntentId(invoice: Stripe.Invoice): string | null {
  for (const payment of invoice.payments?.data ?? []) {
    const paymentIntentId = getId(payment.payment.payment_intent)
    if (paymentIntentId) return paymentIntentId
  }

  const legacyPaymentIntent = (invoice as Stripe.Invoice & { payment_intent?: unknown })
    .payment_intent

  return getId(legacyPaymentIntent)
}

async function resolveUser(input: {
  metadata: Record<string, string>
  subscriptionId?: string | null
  customerId?: string | null
}): Promise<VerifiedUser | null> {
  let user = null
  const userId = getUserIdFromMetadata(input.metadata)

  if (userId) user = await findUserById(userId)
  if (!user && input.subscriptionId) {
    user = await findUserByStripeSubscriptionId(input.subscriptionId)
  }
  if (!user && input.customerId) {
    user = await findUserByStripeCustomerId(input.customerId)
  }

  if (!user?.email || !isSubscriptionRole(user.role)) return null

  return {
    id: String(user._id),
    email: user.email,
    role: user.role,
  }
}

async function applySubscriptionStatus(
  user: VerifiedUser,
  subscription: Stripe.Subscription
) {
  const customerId = getId(subscription.customer)
  const subscriptionId = subscription.id
  const status = subscription.status

  if (subscription.cancel_at_period_end && isActiveSubscriptionStatus(status)) {
    await setUserSubscriptionState({
      userId: user.id,
      plan: "pro",
      subscriptionStatus: "cancel_scheduled",
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
    })
    return
  }

  if (isActiveSubscriptionStatus(status) || status === "past_due") {
    await setUserSubscriptionState({
      userId: user.id,
      plan: "pro",
      subscriptionStatus: status,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
    })
    return
  }

  await setUserSubscriptionState({
    userId: user.id,
    plan: "free",
    subscriptionStatus: status,
    stripeCustomerId: customerId,
    stripeSubscriptionId: isTerminalSubscriptionStatus(status) ? null : subscriptionId,
  })
}

async function recordPaidInvoice(input: {
  eventId: string
  user: VerifiedUser
  invoice: Stripe.Invoice
  sessionId: string | null
  subscriptionId: string | null
  customerId: string | null
}) {
  const amountCents = input.invoice.amount_paid

  if (typeof amountCents !== "number" || amountCents <= 0) return

  await recordSuccessfulPayment({
    stripeEventId: input.eventId,
    userId: input.user.id,
    userEmail: input.user.email,
    role: input.user.role,
    plan: "pro",
    amount: amountCents / 100,
    amountCents,
    currency: input.invoice.currency || "usd",
    stripeSessionId: input.sessionId,
    stripeCustomerId: input.customerId,
    stripeSubscriptionId: input.subscriptionId,
    stripePaymentIntentId: getInvoicePaymentIntentId(input.invoice),
    stripeInvoiceId: input.invoice.id,
    paymentStatus: "paid",
    createdAt: new Date(),
  })
}

async function getSubscriptionInvoice(subscriptionId: string) {
  const subscription = await retrieveStripeSubscription(subscriptionId)
  const invoiceId = getId(subscription.latest_invoice)

  if (!invoiceId) return { subscription, invoice: null }

  const invoice = await getStripe().invoices.retrieve(invoiceId)

  return { subscription, invoice }
}

async function processEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object
      if (session.mode !== "subscription") return

      const subscriptionId = getId(session.subscription)
      if (!subscriptionId) return

      const { subscription, invoice } = await getSubscriptionInvoice(subscriptionId)
      const customerId = getId(session.customer) ?? getId(subscription.customer)
      const user = await resolveUser({
        metadata: {
          ...(session.metadata ?? {}),
          ...(subscription.metadata ?? {}),
        },
        subscriptionId,
        customerId,
      })
      if (!user) return

      await applySubscriptionStatus(user, subscription)

      if (invoice && isActiveSubscriptionStatus(subscription.status)) {
        await recordPaidInvoice({
          eventId: event.id,
          user,
          invoice,
          sessionId: session.id,
          subscriptionId,
          customerId,
        })
      }
      return
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object
      const subscriptionId = getInvoiceSubscriptionId(invoice)
      if (!subscriptionId) return

      const subscription = await retrieveStripeSubscription(subscriptionId)
      const customerId = getId(invoice.customer) ?? getId(subscription.customer)
      const user = await resolveUser({
        metadata: subscription.metadata ?? {},
        subscriptionId,
        customerId,
      })
      if (!user) return

      await applySubscriptionStatus(user, subscription)

      if (isActiveSubscriptionStatus(subscription.status)) {
        await recordPaidInvoice({
          eventId: event.id,
          user,
          invoice,
          sessionId: null,
          subscriptionId,
          customerId,
        })
      }
      return
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object
      const subscriptionId = getInvoiceSubscriptionId(invoice)
      if (!subscriptionId) return

      const subscription = await retrieveStripeSubscription(subscriptionId)
      const user = await resolveUser({
        metadata: subscription.metadata ?? {},
        subscriptionId,
        customerId: getId(invoice.customer),
      })
      if (!user) return

      await applySubscriptionStatus(user, subscription)
      return
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object
      const user = await resolveUser({
        metadata: subscription.metadata ?? {},
        subscriptionId: subscription.id,
        customerId: getId(subscription.customer),
      })
      if (!user) return

      await applySubscriptionStatus(user, subscription)
      return
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object
      const user = await resolveUser({
        metadata: subscription.metadata ?? {},
        subscriptionId: subscription.id,
        customerId: getId(subscription.customer),
      })
      if (!user) return

      await setUserSubscriptionState({
        userId: user.id,
        plan: "free",
        subscriptionStatus: "canceled",
        stripeCustomerId: getId(subscription.customer),
        stripeSubscriptionId: null,
      })
      return
    }

    default:
      return
  }
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header." },
        { status: 400 }
      )
    }

    let webhookSecret: string
    try {
      webhookSecret = getStripeWebhookSecret()
    } catch {
      return NextResponse.json(
        {
          error:
            "STRIPE_WEBHOOK_SECRET is not configured on the server. Add it from Stripe Dashboard → Developers → Webhooks (test mode).",
        },
        { status: 500 }
      )
    }

    // Stripe signatures are computed over the exact raw request body.
    const body = await request.text()
    const event = await getStripe().webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    )

    const claimed = await claimWebhookEvent(event.id)
    if (!claimed) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    try {
      await processEvent(event)
      await markWebhookEventProcessed(event.id)
    } catch (error) {
      await releaseWebhookEvent(event.id)
      throw error
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Stripe webhook failed:", message)

    const isSignatureError =
      message.toLowerCase().includes("signature") ||
      message.toLowerCase().includes("payload")

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: isSignatureError ? 400 : 500 }
    )
  }
}

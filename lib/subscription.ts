import { ObjectId } from "mongodb"

import { getDatabase } from "./db"
import { getStripe } from "./stripe"

export type SubscriptionRole = "student" | "tutor"
export type SubscriptionPlan = "free" | "pro"

interface WebhookEventDocument {
  _id: string
  status: "processing" | "processed"
  createdAt: Date
  processedAt?: Date
}

export interface PlanConfig {
  role: SubscriptionRole
  plan: "pro"
  unitAmountCents: number
  currency: "usd"
  productName: string
  description: string
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionRole, PlanConfig> = {
  student: {
    role: "student",
    plan: "pro",
    unitAmountCents: 1000,
    currency: "usd",
    productName: "MentorLagbe Student Pro",
    description: "Student Pro monthly subscription",
  },
  tutor: {
    role: "tutor",
    plan: "pro",
    unitAmountCents: 1500,
    currency: "usd",
    productName: "MentorLagbe Tutor Pro",
    description: "Tutor Pro monthly subscription",
  },
}

export const FREE_BOOKMARK_LIMIT = 5

export function isSubscriptionRole(value: unknown): value is SubscriptionRole {
  return value === "student" || value === "tutor"
}

export function getPlanConfig(role: SubscriptionRole): PlanConfig {
  return SUBSCRIPTION_PLANS[role]
}

export function isValidObjectId(
  value: string | null | undefined
): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-fA-F]{24}$/.test(value) &&
    ObjectId.isValid(value)
  )
}

export function getUserIdFromMetadata(
  metadata: Record<string, string> | null | undefined
): string | null {
  const userId = metadata?.userId
  return isValidObjectId(userId) ? userId : null
}

interface SubscriptionUser {
  _id: ObjectId
  email?: string
  role?: string
  plan?: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  subscriptionStatus?: string
}

export async function findUserById(userId: string) {
  if (!isValidObjectId(userId)) return null

  const db = await getDatabase()
  return db
    .collection<SubscriptionUser>("user")
    .findOne({ _id: new ObjectId(userId) })
}

export async function findUserByStripeSubscriptionId(subscriptionId: string) {
  const db = await getDatabase()
  return db
    .collection<SubscriptionUser>("user")
    .findOne({ stripeSubscriptionId: subscriptionId })
}

export async function findUserByStripeCustomerId(customerId: string) {
  const db = await getDatabase()
  return db
    .collection<SubscriptionUser>("user")
    .findOne({ stripeCustomerId: customerId })
}

/** Blocks a second checkout while the user is already marked Pro. */
export async function hasActiveProSubscription(userId: string) {
  const user = await findUserById(userId)
  return user?.plan === "pro"
}

export async function getUserPlanInfo(userId: string) {
  const user = await findUserById(userId)
  if (!user) return null

  return {
    plan: user.plan === "pro" ? ("pro" as const) : ("free" as const),
    role: user.role ?? null,
    subscriptionStatus: user.subscriptionStatus ?? null,
  }
}

interface SetSubscriptionStateInput {
  userId: string
  plan: SubscriptionPlan
  subscriptionStatus: string
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
}

/** Updates the user plan plus the existing tutorPlan record used by tutor limits. */
export async function setUserSubscriptionState(input: SetSubscriptionStateInput) {
  if (!isValidObjectId(input.userId)) {
    throw new Error("Invalid user ID.")
  }

  const user = await findUserById(input.userId)
  if (!user) {
    throw new Error("User not found.")
  }

  const db = await getDatabase()
  const set: Record<string, unknown> = {
    plan: input.plan,
    subscriptionStatus: input.subscriptionStatus,
    updatedAt: new Date(),
  }
  const unset: Record<string, ""> = {}

  if (input.stripeCustomerId) {
    set.stripeCustomerId = input.stripeCustomerId
  } else if (input.stripeCustomerId === null) {
    unset.stripeCustomerId = ""
  }

  if (input.stripeSubscriptionId) {
    set.stripeSubscriptionId = input.stripeSubscriptionId
  } else if (input.stripeSubscriptionId === null) {
    unset.stripeSubscriptionId = ""
  }

  const update: { $set: Record<string, unknown>; $unset?: Record<string, ""> } = {
    $set: set,
  }
  if (Object.keys(unset).length > 0) update.$unset = unset

  await db
    .collection<SubscriptionUser>("user")
    .updateOne({ _id: new ObjectId(input.userId) }, update)

  if (user.role === "tutor") {
    await db.collection("tutorPlan").updateOne(
      { userId: input.userId },
      {
        $set: {
          userId: input.userId,
          plan: input.plan,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    )
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  )
}

let webhookEventsReady: Promise<void> | null = null

async function ensureWebhookEventsCollection() {
  if (!webhookEventsReady) {
    webhookEventsReady = (async () => {
      const db = await getDatabase()
      await db.collection("webhook_events").createIndex(
        { status: 1, createdAt: 1 },
        { name: "status_createdAt" }
      )
    })()
  }

  return webhookEventsReady
}

/** Atomically claims an event. Returns false when it was already claimed. */
export async function claimWebhookEvent(eventId: string): Promise<boolean> {
  await ensureWebhookEventsCollection()
  const db = await getDatabase()

  try {
    await db.collection<WebhookEventDocument>("webhook_events").insertOne({
      _id: eventId,
      status: "processing",
      createdAt: new Date(),
    })
    return true
  } catch (error) {
    if (isDuplicateKeyError(error)) return false
    throw error
  }
}

export async function markWebhookEventProcessed(eventId: string) {
  const db = await getDatabase()
  await db.collection<WebhookEventDocument>("webhook_events").updateOne(
    { _id: eventId },
    { $set: { status: "processed", processedAt: new Date() } }
  )
}

export async function releaseWebhookEvent(eventId: string) {
  const db = await getDatabase()
  await db.collection<WebhookEventDocument>("webhook_events").deleteOne({
    _id: eventId,
    status: "processing",
  })
}

export interface PaymentRecord {
  stripeEventId: string
  userId: string
  userEmail: string
  role: SubscriptionRole
  plan: "pro"
  amount: number
  amountCents: number
  currency: string
  stripeSessionId: string | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripePaymentIntentId: string | null
  stripeInvoiceId: string
  paymentStatus: "paid"
  createdAt: Date
}

type PaymentDocument = PaymentRecord & { _id: string }

let paymentsReady: Promise<void> | null = null

async function ensurePaymentsCollection() {
  if (!paymentsReady) {
    paymentsReady = (async () => {
      const db = await getDatabase()
      await db.collection("payments").createIndex(
        { stripeEventId: 1 },
        { unique: true, name: "stripeEventId_unique" }
      )
      // Older local databases used a sparse unique index here. A sparse index
      // still indexes explicit nulls, which blocked a second payment with no
      // payment intent. The deterministic _id already prevents duplicates.
      try {
        await db.collection("payments").dropIndex("stripePaymentIntentId_unique")
      } catch {
        // The legacy index does not exist on this database.
      }
      await db.collection("payments").createIndex(
        { stripeInvoiceId: 1 },
        { unique: true, name: "stripeInvoiceId_unique" }
      )
    })()
  }

  return paymentsReady
}

/** Inserts a verified paid payment once, even if the same event is redelivered. */
export async function recordSuccessfulPayment(record: PaymentRecord) {
  await ensurePaymentsCollection()
  const db = await getDatabase()
  const id = record.stripePaymentIntentId
    ? `pi:${record.stripePaymentIntentId}`
    : `inv:${record.stripeInvoiceId}`

  await db.collection<PaymentDocument>("payments").updateOne(
    { _id: id },
    { $setOnInsert: { ...record, createdAt: new Date() } },
    { upsert: true }
  )
}

/** Retrieves a Stripe subscription for status checks during webhook processing. */
export async function retrieveStripeSubscription(subscriptionId: string) {
  return getStripe().subscriptions.retrieve(subscriptionId)
}

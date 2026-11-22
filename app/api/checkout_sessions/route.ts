import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { getAppBaseUrl, getStripe } from "@/lib/stripe"
import {
  getPlanConfig,
  hasActiveProSubscription,
  isSubscriptionRole,
} from "@/lib/subscription"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const authSession = await auth.api.getSession({
      headers: await headers(),
      query: { disableCookieCache: true },
    })
    const user = authSession?.user

    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to subscribe." },
        { status: 401 }
      )
    }

    if (!isSubscriptionRole(user.role)) {
      return NextResponse.json(
        { error: "Only students and tutors can purchase these plans." },
        { status: 403 }
      )
    }

    if (await hasActiveProSubscription(user.id)) {
      return NextResponse.json(
        { error: "You already have an active Pro subscription." },
        { status: 409 }
      )
    }

    const plan = getPlanConfig(user.role)
    const stripe = getStripe()
    const baseUrl = getAppBaseUrl(new URL(request.url).origin)
    const metadata = {
      userId: user.id,
      userEmail: user.email,
      role: user.role,
      plan: "pro",
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      client_reference_id: user.id,
      customer_email: user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: plan.currency,
            unit_amount: plan.unitAmountCents,
            recurring: { interval: "month" },
            product_data: {
              name: plan.productName,
              description: plan.description,
            },
          },
        },
      ],
      metadata,
      subscription_data: { metadata },
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancel`,
    })

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("POST /api/checkout_sessions failed:", message)

    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    )
  }
}

import Stripe from "stripe"

let stripeClient

/** Server-only Stripe client. Never import this from a client component. */
export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured on the server.")
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey)
  }

  return stripeClient
}

/** Server-only webhook signing secret from the Stripe Dashboard. */
export function getStripeWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured on the server.")
  }

  return secret
}

/** Public app URL used for Stripe redirects. Secrets are never included. */
export function getAppBaseUrl(fallbackOrigin) {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || fallbackOrigin

  if (!configuredUrl) {
    throw new Error("Application base URL is not configured on the server.")
  }

  return configuredUrl.replace(/\/+$/, "")
}

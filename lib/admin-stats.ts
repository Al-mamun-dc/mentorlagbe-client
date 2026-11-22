import type { Document } from "mongodb"

import { getDatabase } from "@/lib/db"
import type { AdminStats, RevenueEntry } from "@/lib/api/admin"

const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
])

function currencyExponent(currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase()) ? 0 : 2
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function isPaidPayment(doc: Document): boolean {
  const paymentStatus = asString(doc.paymentStatus).toLowerCase()
  if (paymentStatus) return paymentStatus === "paid"

  // Defensive support for alternate payment document shapes.
  if (doc.paid === true) return true
  const status = asString(doc.status).toLowerCase()
  return status === "succeeded" || status === "paid"
}

function isFailedOrUnpaid(doc: Document): boolean {
  const paymentStatus = asString(doc.paymentStatus).toLowerCase()
  if (["failed", "unpaid", "canceled", "cancelled", "requires_payment_method"].includes(paymentStatus)) {
    return true
  }

  const status = asString(doc.status).toLowerCase()
  if (["failed", "unpaid", "canceled", "cancelled", "requires_payment_method"].includes(status)) {
    return true
  }

  return doc.paid === false
}

function amountInMajorUnits(doc: Document, currency: string): number | null {
  const cents = asNumber(doc.amountCents)
  if (cents !== null) {
    return cents / 10 ** currencyExponent(currency)
  }

  const total = asNumber(doc.amountTotal) ?? asNumber(doc.amount_total)
  if (total !== null) {
    return total / 10 ** currencyExponent(currency)
  }

  const amount = asNumber(doc.amount)
  return amount !== null ? amount : null
}

function paymentMode(doc: Document): "live" | "test" {
  if (doc.livemode === true) return "live"
  if (doc.livemode === false) return "test"

  const sessionId = asString(doc.stripeSessionId || doc.sessionId)
  if (sessionId.startsWith("cs_live_")) return "live"
  if (sessionId.startsWith("cs_test_")) return "test"

  const mode = asString(doc.mode).toLowerCase()
  if (mode === "live") return "live"
  return "test"
}

function dedupeKey(doc: Document): string | null {
  const id = doc._id
  if (typeof id === "string" && id.startsWith("pi_")) return id
  if (typeof id === "string" && id.startsWith("pi:")) return id.slice(3)
  if (typeof id === "string" && id.startsWith("inv:")) return `inv:${id.slice(4)}`

  const paymentIntentId = asString(doc.stripePaymentIntentId || doc.paymentIntentId)
  if (paymentIntentId) return `pi:${paymentIntentId}`

  const invoiceId = asString(doc.stripeInvoiceId || doc.invoiceId)
  if (invoiceId) return `inv:${invoiceId}`

  const sessionId = asString(doc.stripeSessionId || doc.sessionId)
  if (sessionId) return `sess:${sessionId}`

  const eventId = asString(doc.stripeEventId || doc.eventId)
  if (eventId) return `evt:${eventId}`

  return null
}

/** Aggregates admin dashboard stats without exposing sensitive user/payment data. */
export async function getAdminStats(): Promise<AdminStats> {
  const db = await getDatabase()
  const userCollection = db.collection("user")
  const tuitionCollection = db.collection("tution")
  const paymentCollection = db.collection("payments")

  const [totalUsers, totalTutors, pendingTuitions, approvedTuitions, paymentDocs] =
    await Promise.all([
      userCollection.countDocuments({}),
      userCollection.countDocuments({ role: "tutor" }),
      tuitionCollection.countDocuments({ approvalStatus: "pending" }),
      tuitionCollection.countDocuments({ approvalStatus: "approved" }),
      paymentCollection
        .find(
          {},
          {
            projection: {
              _id: 1,
              amount: 1,
              amountCents: 1,
              amountTotal: 1,
              amount_total: 1,
              currency: 1,
              paymentStatus: 1,
              status: 1,
              paid: 1,
              livemode: 1,
              mode: 1,
              stripeSessionId: 1,
              sessionId: 1,
              stripePaymentIntentId: 1,
              paymentIntentId: 1,
              stripeInvoiceId: 1,
              invoiceId: 1,
              stripeEventId: 1,
              eventId: 1,
            },
          }
        )
        .toArray(),
    ])

  const seen = new Set<string>()
  const totals = new Map<string, { amount: number; transactionCount: number; mode: "live" | "test" | "mixed" }>()

  for (const doc of paymentDocs) {
    if (isFailedOrUnpaid(doc) || !isPaidPayment(doc)) continue

    const key = dedupeKey(doc)
    if (key) {
      if (seen.has(key)) continue
      seen.add(key)
    }

    const currency = asString(doc.currency).toUpperCase() || "USD"
    const amount = amountInMajorUnits(doc, currency)
    if (amount === null || amount <= 0) continue

    const mode = paymentMode(doc)
    const current = totals.get(currency) ?? { amount: 0, transactionCount: 0, mode }
    current.amount += amount
    current.transactionCount += 1
    current.mode = current.mode === mode ? current.mode : "mixed"
    totals.set(currency, current)
  }

  const revenue: RevenueEntry[] = Array.from(totals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([currency, value]) => ({
      currency,
      amount: Number(value.amount.toFixed(currencyExponent(currency))),
      exponent: currencyExponent(currency),
      transactionCount: value.transactionCount,
      mode: value.mode,
    }))

  return {
    totalUsers,
    totalTutors,
    pendingTuitions,
    approvedTuitions,
    revenue,
  }
}

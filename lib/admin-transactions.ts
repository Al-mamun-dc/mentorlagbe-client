import { ObjectId, type Document } from "mongodb"

import { getDatabase } from "@/lib/db"
import type {
  AdminTransaction,
  AdminTransactionsResponse,
  PaymentRole,
  PaymentStatus,
  RevenueEntry,
} from "@/lib/api/admin"

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

function asString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function currencyExponent(currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase()) ? 0 : 2
}

function asTimestamp(value: unknown): string | null {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.toISOString() : null
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value)
    return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : value
  }
  return null
}

function normalizeStatus(doc: Document): PaymentStatus {
  const paymentStatus = asString(doc.paymentStatus).toLowerCase()
  if (paymentStatus === "paid") return "paid"
  if (
    ["failed", "unpaid", "canceled", "cancelled", "requires_payment_method"].includes(
      paymentStatus
    )
  ) {
    return paymentStatus === "failed" ? "failed" : "unpaid"
  }

  if (doc.paid === true) return "paid"
  if (doc.paid === false) return "failed"

  const status = asString(doc.status).toLowerCase()
  if (status === "succeeded" || status === "paid") return "paid"
  if (
    ["failed", "unpaid", "canceled", "cancelled", "requires_payment_method"].includes(
      status
    )
  ) {
    return status === "failed" ? "failed" : "unpaid"
  }

  return "unknown"
}

function amountInMajorUnits(doc: Document, currency: string): number | null {
  const cents = asNumber(doc.amountCents)
  if (cents !== null) return cents / 10 ** currencyExponent(currency)

  const total = asNumber(doc.amountTotal) ?? asNumber(doc.amount_total)
  if (total !== null) return total / 10 ** currencyExponent(currency)

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

function dedupeKey(doc: Document): string {
  const id = doc._id
  if (typeof id === "string" && id.startsWith("pi:")) return id
  if (typeof id === "string" && id.startsWith("inv:")) return id

  const paymentIntentId = asString(doc.stripePaymentIntentId || doc.paymentIntentId)
  if (paymentIntentId) return `pi:${paymentIntentId}`

  const invoiceId = asString(doc.stripeInvoiceId || doc.invoiceId)
  if (invoiceId) return `inv:${invoiceId}`

  const sessionId = asString(doc.stripeSessionId || doc.sessionId)
  if (sessionId) return `sess:${sessionId}`

  const eventId = asString(doc.stripeEventId || doc.eventId)
  if (eventId) return `evt:${eventId}`

  return `doc:${String(id)}`
}

function transactionId(doc: Document): string {
  const invoiceId = asString(doc.stripeInvoiceId || doc.invoiceId)
  if (invoiceId) return invoiceId

  const paymentIntentId = asString(doc.stripePaymentIntentId || doc.paymentIntentId)
  if (paymentIntentId) return paymentIntentId

  const sessionId = asString(doc.stripeSessionId || doc.sessionId)
  if (sessionId) return sessionId

  return String(doc._id)
}

function normalizeRole(value: unknown): PaymentRole | "unknown" {
  return value === "student" || value === "tutor" ? value : "unknown"
}

function planName(role: PaymentRole | "unknown"): string {
  if (role === "student") return "Student Pro"
  if (role === "tutor") return "Tutor Pro"
  return "Pro Plan"
}

function toObjectId(value: string): ObjectId | null {
  return /^[0-9a-fA-F]{24}$/.test(value) && ObjectId.isValid(value)
    ? new ObjectId(value)
    : null
}

export async function getAdminTransactions(): Promise<AdminTransactionsResponse> {
  const db = await getDatabase()
  const payments = await db
    .collection("payments")
    .find(
      {},
      {
        projection: {
          _id: 1,
          userId: 1,
          userEmail: 1,
          role: 1,
          plan: 1,
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
          stripeCustomerId: 1,
          stripeSubscriptionId: 1,
          stripePaymentIntentId: 1,
          paymentIntentId: 1,
          stripeInvoiceId: 1,
          invoiceId: 1,
          stripeEventId: 1,
          eventId: 1,
          createdAt: 1,
        },
      }
    )
    .sort({ createdAt: -1, _id: -1 })
    .toArray()

  const seen = new Set<string>()
  const deduped: Document[] = []
  for (const doc of payments) {
    const key = dedupeKey(doc)
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(doc)
  }

  const userIds = Array.from(
    new Set(
      deduped
        .map((doc) => asString(doc.userId))
        .filter((id) => id.length > 0)
    )
  )
  const objectIds = userIds
    .map(toObjectId)
    .filter((id): id is ObjectId => id !== null)

  const users =
    objectIds.length > 0
      ? await db
          .collection("user")
          .find(
            { _id: { $in: objectIds } },
            { projection: { _id: 1, name: 1, email: 1, role: 1 } }
          )
          .toArray()
      : []

  const usersById = new Map<string, Document>()
  for (const user of users) usersById.set(String(user._id), user)

  const revenueTotals = new Map<
    string,
    { amount: number; transactionCount: number; mode: "live" | "test" | "mixed" }
  >()
  let studentPayments = 0
  let tutorPayments = 0
  let totalTransactions = 0

  const transactions: AdminTransaction[] = deduped.map((doc) => {
    const currency = asString(doc.currency).toUpperCase() || "USD"
    const amount = amountInMajorUnits(doc, currency) ?? 0
    const cents = asNumber(doc.amountCents)
    const role = normalizeRole(doc.role)
    const userId = asString(doc.userId)
    const user = userId ? usersById.get(userId) : undefined
    const email = asString(doc.userEmail) || asString(user?.email) || "Not available"
    const userName = asString(user?.name) || "Unknown User"
    const displayRole = role === "unknown" ? normalizeRole(user?.role) : role
    const mode = paymentMode(doc)
    const status = normalizeStatus(doc)

    if (status === "paid") {
      totalTransactions += 1
      if (displayRole === "student") studentPayments += 1
      if (displayRole === "tutor") tutorPayments += 1

      const current = revenueTotals.get(currency) ?? {
        amount: 0,
        transactionCount: 0,
        mode,
      }
      current.amount += amount
      current.transactionCount += 1
      current.mode = current.mode === mode ? current.mode : "mixed"
      revenueTotals.set(currency, current)
    }

    return {
      id: String(doc._id),
      userName,
      email,
      role: displayRole,
      planName: planName(displayRole),
      amount: Number(amount.toFixed(currencyExponent(currency))),
      amountCents: cents,
      currency,
      transactionId: transactionId(doc),
      paymentDate: asTimestamp(doc.createdAt),
      paymentStatus: status,
      mode,
    }
  })

  const totalRevenue: RevenueEntry[] = Array.from(revenueTotals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([currency, value]) => ({
      currency,
      amount: Number(value.amount.toFixed(currencyExponent(currency))),
      exponent: currencyExponent(currency),
      transactionCount: value.transactionCount,
      mode: value.mode,
    }))

  return {
    transactions,
    summary: {
      totalTransactions,
      totalRevenue,
      studentPayments,
      tutorPayments,
    },
  }
}

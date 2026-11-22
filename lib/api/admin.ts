export type AdminRole = "student" | "tutor" | "admin"

/** Only non-sensitive user fields are returned by the protected admin API. */
export interface AdminUser {
  id: string
  name: string
  email: string
  role: AdminRole | null
  plan: "free" | "pro"
  createdAt: string | null
}

export interface RevenueEntry {
  currency: string
  amount: number
  exponent: number
  transactionCount: number
  mode: "live" | "test" | "mixed"
}

export interface AdminStats {
  totalUsers: number
  totalTutors: number
  pendingTuitions: number
  approvedTuitions: number
  revenue: RevenueEntry[]
}

export type PaymentRole = "student" | "tutor"
export type PaymentStatus = "paid" | "failed" | "unpaid" | "unknown"

export interface AdminTransaction {
  id: string
  userName: string
  email: string
  role: PaymentRole | "unknown"
  planName: string
  amount: number
  amountCents: number | null
  currency: string
  transactionId: string
  paymentDate: string | null
  paymentStatus: PaymentStatus
  mode: "live" | "test"
}

export interface AdminTransactionSummary {
  totalTransactions: number
  totalRevenue: RevenueEntry[]
  studentPayments: number
  tutorPayments: number
}

export interface AdminTransactionsResponse {
  transactions: AdminTransaction[]
  summary: AdminTransactionSummary
}

interface ApiError {
  error?: string
}

async function readJson<T>(res: Response, fallback: T): Promise<T> {
  const text = await res.text()
  let result: unknown = fallback

  try {
    result = text ? JSON.parse(text) : fallback
  } catch {
    result = fallback
  }

  if (!res.ok) {
    const error = (result as ApiError | null)?.error
    throw new Error(error || `Request failed. (HTTP ${res.status})`)
  }

  return result as T
}

/** Fetches dashboard statistics from the protected Next.js API. */
export const getAdminStats = async (): Promise<AdminStats> => {
  const res = await fetch("/api/admin/stats", {
    credentials: "include",
    cache: "no-store",
  })

  const data = await readJson<Partial<AdminStats> | null>(res, null)
  if (!data) throw new Error("The server did not return dashboard statistics.")

  return {
    totalUsers: Number(data.totalUsers) || 0,
    totalTutors: Number(data.totalTutors) || 0,
    pendingTuitions: Number(data.pendingTuitions) || 0,
    approvedTuitions: Number(data.approvedTuitions) || 0,
    revenue: Array.isArray(data.revenue) ? data.revenue : [],
  }
}

/** Fetches the safe, minimal user list for admin management. */
export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const res = await fetch("/api/admin/users", {
    credentials: "include",
    cache: "no-store",
  })

  const data = await readJson<{ users?: unknown } | null>(res, null)
  return Array.isArray(data?.users) ? (data.users as AdminUser[]) : []
}

/** Changes only a user's role; identity and authorization come from the session. */
export const updateAdminUserRole = async (
  userId: string,
  role: AdminRole
): Promise<AdminUser> => {
  const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/role`, {
    method: "PATCH",
    credentials: "include",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ role }),
  })

  const data = await readJson<{ user?: AdminUser } | null>(res, null)
  if (!data?.user) throw new Error("The server did not return the updated user.")

  return data.user
}

/** Fetches payment transactions for admin review. Read-only. */
export const getAdminTransactions = async (): Promise<AdminTransactionsResponse> => {
  const res = await fetch("/api/admin/transactions", {
    credentials: "include",
    cache: "no-store",
  })

  const data = await readJson<Partial<AdminTransactionsResponse> | null>(res, null)
  if (!data || !Array.isArray(data.transactions) || !data.summary) {
    throw new Error("The server did not return transaction data.")
  }

  return {
    transactions: data.transactions as AdminTransaction[],
    summary: data.summary as AdminTransactionSummary,
  }
}

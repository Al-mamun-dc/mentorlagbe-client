"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  BadgeDollarSign,
  CreditCard,
  GraduationCap,
  RefreshCw,
  Search,
  Users,
} from "lucide-react"

import {
  getAdminTransactions,
  type AdminTransaction,
  type AdminTransactionsResponse,
  type PaymentStatus,
} from "@/lib/api/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type RoleFilter = "all" | "student" | "tutor"
type StatusFilter = "all" | PaymentStatus

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

function formatCurrency(amount: number, currency: string, exponent = 2) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: exponent,
      maximumFractionDigits: exponent,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(exponent)}`
  }
}

function formatDate(value: string | null): string {
  if (!value) return "Not available"
  const parsed = new Date(value)
  if (!Number.isFinite(parsed.getTime())) return value
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed)
}

function revenueLabel(summary: AdminTransactionsResponse["summary"]): string {
  if (summary.totalRevenue.length === 0) return "No paid revenue"
  return summary.totalRevenue
    .map((entry) => {
      const amount = formatCurrency(entry.amount, entry.currency, entry.exponent)
      if (entry.mode === "test") return `${amount} (Test)`
      if (entry.mode === "mixed") return `${amount} (Mixed)`
      return amount
    })
    .join(" · ")
}

function revenueDescription(summary: AdminTransactionsResponse["summary"]): string {
  if (summary.totalRevenue.length === 0) {
    return "No successful paid transactions found."
  }
  const parts = [
    `${summary.totalTransactions} successful paid transaction${summary.totalTransactions === 1 ? "" : "s"}`,
  ]
  if (summary.totalRevenue.length > 1) parts.push("separate by currency")
  if (summary.totalRevenue.some((entry) => entry.mode === "test" || entry.mode === "mixed")) {
    parts.push("includes Stripe test-mode revenue")
  }
  return `${parts.join("; ")}.`
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string
  value: string | number
  description: string
  icon: typeof Users
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-500">
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
    </article>
  )
}

function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          <div className="h-9 w-20 animate-pulse rounded bg-muted" />
          <div className="h-3 w-full max-w-[14rem] animate-pulse rounded bg-muted" />
        </div>
        <div className="size-11 shrink-0 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const styles: Record<PaymentStatus, string> = {
    paid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    failed: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    unpaid: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    unknown: "border-border bg-muted text-muted-foreground",
  }
  const label = status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      {label}
    </span>
  )
}

function RoleBadge({ role }: { role: AdminTransaction["role"] }) {
  const label = role === "unknown" ? "Unknown" : role.charAt(0).toUpperCase() + role.slice(1)
  const className =
    role === "student"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : role === "tutor"
        ? "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300"
        : "border-border bg-muted text-muted-foreground"
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

export default function AdminTransactions() {
  const [data, setData] = useState<AdminTransactionsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let isMounted = true
    async function load() {
      setIsLoading(true)
      setError("")
      try {
        const result = await getAdminTransactions()
        if (isMounted) setData(result)
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load transactions.")
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    void load()
    return () => {
      isMounted = false
    }
  }, [reloadToken])

  const filtered = useMemo(() => {
    const transactions = data?.transactions ?? []
    const query = search.trim().toLowerCase()
    return transactions.filter((tx) => {
      const matchesRole = roleFilter === "all" ? true : tx.role === roleFilter
      const matchesStatus = statusFilter === "all" ? true : tx.paymentStatus === statusFilter
      const matchesQuery =
        !query ||
        tx.userName.toLowerCase().includes(query) ||
        tx.email.toLowerCase().includes(query) ||
        tx.transactionId.toLowerCase().includes(query)
      return matchesRole && matchesStatus && matchesQuery
    })
  }, [data?.transactions, roleFilter, search, statusFilter])

  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
            Admin dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Transaction Management
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review Stripe subscription payments. Payment records are read-only.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setReloadToken((t) => t + 1)}
          disabled={isLoading}
        >
          <RefreshCw className={isLoading ? "animate-spin" : ""} aria-hidden />
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/5 px-6 py-16 text-center">
          <AlertCircle className="mx-auto size-7 text-rose-500" aria-hidden />
          <p role="alert" className="mt-4 text-sm text-rose-600 dark:text-rose-400">
            {error}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-5"
            onClick={() => setReloadToken((t) => t + 1)}
          >
            <RefreshCw aria-hidden />
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {isLoading || !data ? (
              <>
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
              </>
            ) : (
              <>
                <StatCard
                  label="Total Transactions"
                  value={data.summary.totalTransactions}
                  description="Successful paid transactions only."
                  icon={CreditCard}
                />
                <StatCard
                  label="Total Revenue"
                  value={revenueLabel(data.summary)}
                  description={revenueDescription(data.summary)}
                  icon={BadgeDollarSign}
                />
                <StatCard
                  label="Student Subscription Payments"
                  value={data.summary.studentPayments}
                  description="Paid Student Pro subscription transactions."
                  icon={Users}
                />
                <StatCard
                  label="Tutor Subscription Payments"
                  value={data.summary.tutorPayments}
                  description="Paid Tutor Pro subscription transactions."
                  icon={GraduationCap}
                />
              </>
            )}
          </div>

          <div className="mb-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or transaction ID"
                className="h-10 pl-9"
                aria-label="Search transactions"
              />
            </div>
            <label className="block">
              <span className="sr-only">Filter by role</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/25"
              >
                <option value="all">All roles</option>
                <option value="student">Student</option>
                <option value="tutor">Tutor</option>
              </select>
            </label>
            <label className="block">
              <span className="sr-only">Filter by payment status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/25"
              >
                <option value="all">All statuses</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="unpaid">Unpaid</option>
                <option value="unknown">Unknown</option>
              </select>
            </label>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl border border-border bg-card" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
              <CreditCard className="mx-auto size-7 text-muted-foreground" aria-hidden />
              <h2 className="mt-4 text-lg font-semibold text-foreground">No transactions found</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a different search or filter.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="hidden lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_90px_120px_110px_minmax(0,1.2fr)_150px_90px] lg:gap-3 lg:border-b lg:border-border lg:bg-muted/30 lg:px-4 lg:py-3 lg:text-xs lg:font-semibold lg:uppercase lg:tracking-wide lg:text-muted-foreground">
                <div>User Name</div>
                <div>Email</div>
                <div>Role</div>
                <div>Plan</div>
                <div>Amount</div>
                <div>Transaction ID</div>
                <div>Payment Date</div>
                <div>Status</div>
              </div>
              <div className="divide-y divide-border">
                {filtered.map((tx) => (
                  <article
                    key={tx.id}
                    className="grid gap-3 px-4 py-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_90px_120px_110px_minmax(0,1.2fr)_150px_90px] lg:items-center"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground" title={tx.userName}>
                        {tx.userName}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground lg:hidden">{tx.email}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-muted-foreground" title={tx.email}>
                        {tx.email}
                      </p>
                    </div>
                    <div>
                      <RoleBadge role={tx.role} />
                    </div>
                    <div className="text-sm text-foreground">{tx.planName}</div>
                    <div className="text-sm font-medium text-foreground">
                      {formatCurrency(tx.amount, tx.currency, currencyExponent(tx.currency))}
                      {tx.mode === "test" ? (
                        <span className="ml-1 text-[11px] font-normal text-muted-foreground">(Test)</span>
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs text-muted-foreground" title={tx.transactionId}>
                        {tx.transactionId}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">{formatDate(tx.paymentDate)}</div>
                    <div>
                      <StatusBadge status={tx.paymentStatus} />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

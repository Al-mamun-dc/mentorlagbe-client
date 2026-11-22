"use client"

import { useEffect, useState } from "react"
import {
  AlertCircle,
  BadgeDollarSign,
  BookOpenCheck,
  Clock3,
  GraduationCap,
  RefreshCw,
  Users,
} from "lucide-react"

import { getAdminStats, type AdminStats } from "@/lib/api/admin"
import { Button } from "@/components/ui/button"

function formatCurrency(amount: number, currency: string, exponent: number) {
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

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
}: {
  label: string
  value: string | number
  description: string
  icon: typeof Users
  iconClass: string
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${iconClass}`}>
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

function revenueLabel(stats: AdminStats): string {
  if (stats.revenue.length === 0) return "No paid revenue"

  return stats.revenue
    .map((entry) => {
      const amount = formatCurrency(entry.amount, entry.currency, entry.exponent)
      if (entry.mode === "test") return `${amount} (Test)`
      if (entry.mode === "mixed") return `${amount} (Mixed)`
      return amount
    })
    .join(" · ")
}

function revenueDescription(stats: AdminStats): string {
  if (stats.revenue.length === 0) {
    return "No successful paid Stripe transactions found."
  }

  const totalTransactions = stats.revenue.reduce((sum, entry) => sum + entry.transactionCount, 0)
  const hasTest = stats.revenue.some((entry) => entry.mode === "test" || entry.mode === "mixed")
  const hasMultipleCurrencies = stats.revenue.length > 1
  const parts = [`${totalTransactions} successful paid transaction${totalTransactions === 1 ? "" : "s"}`]

  if (hasMultipleCurrencies) parts.push("shown separately by currency")
  if (hasTest) parts.push("includes Stripe test-mode revenue")

  return `${parts.join("; ")}.`
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function loadStats() {
      setIsLoading(true)
      setError("")

      try {
        const result = await getAdminStats()
        if (isMounted) setStats(result)
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard statistics.")
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadStats()
    return () => {
      isMounted = false
    }
  }, [reloadToken])

  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
            Admin dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Overview
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Monitor users, tuition approvals, and paid Stripe revenue across MentorLagbe.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setReloadToken((token) => token + 1)}
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
            onClick={() => setReloadToken((token) => token + 1)}
          >
            <RefreshCw aria-hidden />
            Retry
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {isLoading || !stats ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <StatCard
                label="Total Users"
                value={stats.totalUsers}
                description="All registered accounts in MentorLagbe."
                icon={Users}
                iconClass="bg-brand-500/10 text-brand-500"
              />
              <StatCard
                label="Total Tutors"
                value={stats.totalTutors}
                description="Users currently assigned the tutor role."
                icon={GraduationCap}
                iconClass="bg-sky-500/10 text-sky-600 dark:text-sky-400"
              />
              <StatCard
                label="Pending Tuitions"
                value={stats.pendingTuitions}
                description="Tuition posts waiting for admin review."
                icon={Clock3}
                iconClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
              />
              <StatCard
                label="Approved Tuitions"
                value={stats.approvedTuitions}
                description="Tuition posts approved for public visibility."
                icon={BookOpenCheck}
                iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              />
              <StatCard
                label="Total Stripe Revenue"
                value={revenueLabel(stats)}
                description={revenueDescription(stats)}
                icon={BadgeDollarSign}
                iconClass="bg-violet-500/10 text-violet-600 dark:text-violet-400"
              />
            </>
          )}
        </div>
      )}
    </section>
  )
}

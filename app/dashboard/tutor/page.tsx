import { AlertCircle, BookOpen, CheckCircle2, Crown, Users } from "lucide-react"
import { redirect } from "next/navigation"

import { DashboardStatCard } from "@/components/dashboard-stat-card"
import { getSessionUser } from "@/lib/admin-auth"
import { getTutorDashboardStats } from "@/lib/dashboard-stats"

export const runtime = "nodejs"

function formatPlan(plan: "free" | "pro"): string {
  return plan === "pro" ? "Pro" : "Free"
}

export default async function TutorDashboardPage() {
  const user = await getSessionUser()

  if (!user) {
    redirect("/sign-in")
  }

  if (user.role !== "tutor") {
    redirect("/")
  }

  let stats: Awaited<ReturnType<typeof getTutorDashboardStats>> | null = null
  let error = ""

  try {
    stats = await getTutorDashboardStats(user.id)
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load dashboard statistics."
  }

  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
          Tutor dashboard
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Overview
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track your tuition posts, applicants, and current plan.
        </p>
      </div>

      {error ? (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/5 px-6 py-16 text-center">
          <AlertCircle className="mx-auto size-7 text-rose-500" aria-hidden />
          <p role="alert" className="mt-4 text-sm text-rose-600 dark:text-rose-400">
            {error}
          </p>
        </div>
      ) : stats ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard
            label="Total Tuitions Posted"
            value={stats.totalTuitionsPosted}
            description="All tuition posts you have created."
            icon={BookOpen}
            iconClassName="bg-brand-500/10 text-brand-500"
          />
          <DashboardStatCard
            label="Active/Approved Tuitions"
            value={stats.activeApprovedTuitions}
            description="Approved tuitions currently visible to students."
            icon={CheckCircle2}
            iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          />
          <DashboardStatCard
            label="Total Applicants Received"
            value={stats.totalApplicantsReceived}
            description="Applications received across your tuition posts."
            icon={Users}
            iconClassName="bg-sky-500/10 text-sky-600 dark:text-sky-400"
          />
          <DashboardStatCard
            label="Current Plan"
            value={formatPlan(stats.currentPlan)}
            description={
              stats.currentPlan === "pro"
                ? "You have access to Pro tutor features."
                : "You are on the Free tutor plan."
            }
            icon={Crown}
            iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
          />
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">No dashboard data available.</p>
        </div>
      )}
    </section>
  )
}

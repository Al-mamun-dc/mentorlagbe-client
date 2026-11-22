"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  RefreshCw,
  Users,
  XCircle,
} from "lucide-react"

import {
  getTutorApplications,
  updateTutorApplicationStatus,
  type TutorApplication,
  type TutorApplicationStatus,
} from "@/lib/api/tutor-applications"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"

function formatDate(value: string | null): string {
  if (!value) return "Not available"
  const d = new Date(value)
  if (!Number.isFinite(d.getTime())) return value
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d)
}

function StatusBadge({ status }: { status: TutorApplicationStatus }) {
  const styles: Record<TutorApplicationStatus, string> = {
    pending:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    accepted:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    rejected:
      "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  }
  const Icon = status === "accepted" ? CheckCircle2 : status === "rejected" ? XCircle : Clock3
  const label = status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  )
}

export default function TutorApplicants() {
  const [applications, setApplications] = useState<TutorApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [reloadToken, setReloadToken] = useState(0)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    async function load() {
      setIsLoading(true)
      setError("")
      try {
        const result = await getTutorApplications()
        if (isMounted) setApplications(result)
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : "Failed to load applications.")
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    void load()
    return () => {
      isMounted = false
    }
  }, [reloadToken])

  const counts = useMemo(() => ({
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  }), [applications])

  async function handleStatus(id: string, status: "accepted" | "rejected") {
    if (savingId) return
    setSavingId(id)
    try {
      const updated = await updateTutorApplicationStatus(id, status)
      setApplications((current) => current.map((a) => (a.id === id ? updated : a)))
      toast.add({
        title: "Status updated",
        description: `Application ${status}.`,
      })
    } catch (err) {
      toast.add({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update status.",
      })
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
            Tutor dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Manage Applicants
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review applications for your tuition posts and accept or reject them.
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

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total applications", value: counts.total },
          { label: "Pending", value: counts.pending },
          { label: "Accepted", value: counts.accepted },
          { label: "Rejected", value: counts.rejected },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-2xl font-bold text-foreground">{item.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-border bg-card px-6 py-16 text-center">
          <LoaderCircle className="mx-auto size-7 animate-spin text-brand-500" aria-hidden />
          <p className="mt-4 text-sm text-muted-foreground">Loading applications...</p>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/5 px-6 py-16 text-center">
          <AlertCircle className="mx-auto size-7 text-rose-500" aria-hidden />
          <p role="alert" className="mt-4 text-sm text-rose-600 dark:text-rose-400">{error}</p>
          <Button type="button" variant="outline" size="sm" className="mt-5" onClick={() => setReloadToken((t) => t + 1)}>
            <RefreshCw aria-hidden />
            Retry
          </Button>
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <Users className="mx-auto size-7 text-muted-foreground" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold text-foreground">No applications yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Applications for your tuition posts will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="hidden xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_130px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_120px_180px] xl:gap-3 xl:border-b xl:border-border xl:bg-muted/30 xl:px-4 xl:py-3 xl:text-xs xl:font-semibold xl:uppercase xl:tracking-wide xl:text-muted-foreground">
            <div>Student Name</div>
            <div>Email</div>
            <div>Phone</div>
            <div>Preferred Schedule</div>
            <div>Note</div>
            <div>Tuition Title</div>
            <div>Status</div>
            <div>Action</div>
          </div>

          <div className="divide-y divide-border">
            {applications.map((app) => {
              const isSaving = savingId === app.id
              return (
                <article
                  key={app.id}
                  className="grid gap-3 px-4 py-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_130px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_120px_180px] xl:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground" title={app.studentName}>
                      {app.studentName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground xl:hidden">{app.studentEmail}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-muted-foreground" title={app.studentEmail}>{app.studentEmail}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">{app.studentPhone}</div>
                  <div className="text-sm text-muted-foreground">{app.preferredSchedule}</div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm text-muted-foreground" title={app.note}>{app.note || "—"}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground" title={app.tuitionTitle}>{app.tuitionTitle}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Applied {formatDate(app.createdAt)}</p>
                  </div>
                  <div><StatusBadge status={app.status} /></div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isSaving || app.status === "accepted"}
                      onClick={() => void handleStatus(app.id, "accepted")}
                      className="border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                    >
                      {isSaving ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
                      Accept
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isSaving || app.status === "rejected"}
                      onClick={() => void handleStatus(app.id, "rejected")}
                      className="border-rose-500/30 text-rose-700 hover:bg-rose-500/10 dark:text-rose-300"
                    >
                      {isSaving ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
                      Reject
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

"use client"

import { useEffect, useState } from "react"
import {
  BookOpen,
  CalendarDays,
  CircleCheck,
  CircleX,
  Clock3,
  Globe,
  GraduationCap,
  Inbox,
  LoaderCircle,
  Mail,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import {
  getAdminTuitions,
  setTuitionApproval,
  type AdminTuition,
  type ApprovalStatus,
} from "@/lib/api/admin-tuition"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"

const TOAST_IDS = {
  approve: "admin-tuition-approve-success",
  reject: "admin-tuition-reject-success",
  updateError: "admin-tuition-update-error",
} as const

const approvalStyles: Record<ApprovalStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  approved: {
    label: "Approved",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  rejected: {
    label: "Rejected",
    className:
      "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
}

function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  const style = approvalStyles[status]
  const Icon =
    status === "approved" ? CircleCheck : status === "rejected" ? CircleX : Clock3

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${style.className}`}
    >
      <Icon className="size-3.5" aria-hidden />
      {style.label}
    </span>
  )
}

function MetaItem({
  icon: Icon,
  label,
  value,
  className = "",
}: {
  icon: LucideIcon
  label: string
  value: string
  className?: string
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5 shrink-0" aria-hidden />
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm font-medium text-foreground ${className || "truncate"}`}
        title={value}
      >
        {value || "Not provided"}
      </dd>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
}: {
  label: string
  value: number
  icon: LucideIcon
  iconClass: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${iconClass}`}>
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <p className="text-2xl font-bold leading-none text-foreground">{value}</p>
        <p className="mt-1.5 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function formatDate(value: string | null): string {
  if (!value) return "Not provided"

  const parsed = new Date(value)
  if (!Number.isFinite(parsed.getTime())) return value

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(parsed)
}

function formatSchedule(daysPerWeek: number): string {
  return `${daysPerWeek} ${daysPerWeek === 1 ? "day" : "days"} per week`
}

export default function AdminTuitions() {
  const [tuitions, setTuitions] = useState<AdminTuition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState("")
  const [actionId, setActionId] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function loadTuitions() {
      setIsLoading(true)
      setFetchError("")

      try {
        const result = await getAdminTuitions()
        if (isMounted) setTuitions(result)
      } catch (error) {
        if (isMounted) {
          setFetchError(
            error instanceof Error
              ? error.message
              : "Failed to load tuitions. Please try again."
          )
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadTuitions()

    return () => {
      isMounted = false
    }
  }, [reloadToken])

  const counts = {
    total: tuitions.length,
    pending: tuitions.filter((item) => item.approvalStatus === "pending").length,
    approved: tuitions.filter((item) => item.approvalStatus === "approved").length,
    rejected: tuitions.filter((item) => item.approvalStatus === "rejected").length,
  }

  async function handleDecision(tuition: AdminTuition, status: "approved" | "rejected") {
    if (actionId) return

    setActionId(tuition.id)

    try {
      const updated = await setTuitionApproval(tuition.id, status)
      setTuitions((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      )

      toast.close(TOAST_IDS.updateError)
      toast.add({
        id: status === "approved" ? TOAST_IDS.approve : TOAST_IDS.reject,
        type: "success",
        title: status === "approved" ? "Tuition approved" : "Tuition rejected",
        description: `"${updated.title}" is now ${updated.approvalStatus}.`,
      })
    } catch (error) {
      toast.add({
        id: TOAST_IDS.updateError,
        type: "error",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update tuition.",
      })
    } finally {
      setActionId(null)
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
          Admin dashboard
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Tuition Approval Queue
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review submitted tuition posts and approve or reject them. Only approved, active
          posts appear in public search.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total tuitions"
          value={counts.total}
          icon={BookOpen}
          iconClass="bg-brand-500/10 text-brand-500"
        />
        <StatCard
          label="Pending review"
          value={counts.pending}
          icon={Clock3}
          iconClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="Approved"
          value={counts.approved}
          icon={CircleCheck}
          iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Rejected"
          value={counts.rejected}
          icon={CircleX}
          iconClass="bg-rose-500/10 text-rose-600 dark:text-rose-400"
        />
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-border bg-card px-6 py-16 text-center">
          <LoaderCircle
            className="mx-auto size-7 animate-spin text-brand-500"
            aria-hidden
          />
          <p className="mt-4 text-sm text-muted-foreground">Loading tuition approvals…</p>
        </div>
      ) : fetchError ? (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/5 px-6 py-16 text-center">
          <CircleX className="mx-auto size-7 text-rose-500" aria-hidden />
          <p role="alert" className="mt-4 text-sm text-rose-600 dark:text-rose-400">
            {fetchError}
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
      ) : tuitions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
            <Inbox className="size-7" aria-hidden />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            No tuition posts yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Tutors have not submitted any tuition posts for review.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {tuitions.map((tuition) => {
            const isPending = tuition.approvalStatus === "pending"
            const isBusy = actionId === tuition.id

            return (
              <article
                key={tuition.id}
                className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-brand-500/30 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2
                      className="truncate text-base font-semibold text-foreground"
                      title={tuition.title}
                    >
                      {tuition.title || "Untitled tuition"}
                    </h2>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <span className="rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-600 dark:text-brand-300">
                        {tuition.subject || "No subject"}
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                        {tuition.classLevel || "No class level"}
                      </span>
                    </div>
                  </div>
                  <ApprovalBadge status={tuition.approvalStatus} />
                </div>

                <dl className="mt-5 grid grid-cols-1 gap-x-4 gap-y-4 text-sm sm:grid-cols-2">
                  <MetaItem
                    icon={Users}
                    label="Tutor name"
                    value={tuition.tutorName}
                  />
                  <MetaItem
                    icon={Mail}
                    label="Tutor email"
                    value={tuition.tutorEmail}
                    className="break-all"
                  />
                  <MetaItem icon={BookOpen} label="Subject" value={tuition.subject} />
                  <MetaItem
                    icon={GraduationCap}
                    label="Class level"
                    value={tuition.classLevel}
                  />
                  <MetaItem
                    icon={tuition.mode === "online" ? Globe : MapPin}
                    label="Mode"
                    value={tuition.mode === "online" ? "Online" : "Offline"}
                  />
                  <MetaItem icon={MapPin} label="Location" value={tuition.location} />
                  <MetaItem
                    icon={Wallet}
                    label="Monthly fee"
                    value={`৳${tuition.monthlyFee.toLocaleString()}`}
                  />
                  <MetaItem
                    icon={CalendarDays}
                    label="Schedule"
                    value={formatSchedule(tuition.daysPerWeek)}
                  />
                  <MetaItem
                    icon={CalendarDays}
                    label="Submission date"
                    value={formatDate(tuition.createdAt)}
                  />
                  <MetaItem
                    icon={ShieldCheck}
                    label="Listing status"
                    value={
                      tuition.isActive ? "Active" : "Inactive"
                    }
                  />
                </dl>

                {tuition.description && (
                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {tuition.description}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                  {isPending ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        className="bg-emerald-500 text-white hover:bg-emerald-400"
                        disabled={actionId !== null}
                        onClick={() => void handleDecision(tuition, "approved")}
                      >
                        {isBusy ? (
                          <LoaderCircle className="animate-spin" aria-hidden />
                        ) : (
                          <CircleCheck aria-hidden />
                        )}
                        Approve
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={actionId !== null}
                        onClick={() => void handleDecision(tuition, "rejected")}
                      >
                        {isBusy ? (
                          <LoaderCircle className="animate-spin" aria-hidden />
                        ) : (
                          <CircleX aria-hidden />
                        )}
                        Reject
                      </Button>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      This tuition has already been reviewed.
                    </p>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

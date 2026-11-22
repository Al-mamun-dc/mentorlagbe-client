"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CircleCheck,
  CircleX,
  Clock3,
  Inbox,
  LoaderCircle,
  Mail,
  RefreshCw,
  Trash2,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import {
  deleteApplication,
  getMyApplications,
  type ApplicationStatus,
  type StudentApplication,
} from "@/lib/api/tution"

const statusStyles: Record<
  ApplicationStatus,
  { label: string; className: string; icon: LucideIcon }
> = {
  pending: {
    label: "Pending",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    icon: Clock3,
  },
  accepted: {
    label: "Accepted",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    icon: CircleCheck,
  },
  rejected: {
    label: "Rejected",
    className: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    icon: CircleX,
  },
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const style = statusStyles[status]
  const Icon = style.icon

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
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5 shrink-0" aria-hidden />
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium text-foreground" title={value}>
        {value}
      </dd>
    </div>
  )
}

function formatDate(value: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

function LoadingGrid() {
  return (
    <div
      className="grid gap-5 lg:grid-cols-2"
      aria-busy="true"
      aria-label="Loading your applications"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
            </div>
            <div className="h-6 w-20 rounded-full bg-muted" />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((__, itemIndex) => (
              <div key={itemIndex}>
                <div className="h-3 w-20 rounded bg-muted" />
                <div className="mt-2 h-4 w-32 rounded bg-muted" />
              </div>
            ))}
          </div>
          <div className="mt-6 h-8 w-28 rounded-lg bg-muted" />
        </div>
      ))}
    </div>
  )
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<StudentApplication[]>([])
  const [totalApplications, setTotalApplications] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [applicationToDelete, setApplicationToDelete] =
    useState<StudentApplication | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadApplications = useCallback(async () => {
    setIsLoading(true)
    setError("")

    try {
      const data = await getMyApplications()
      setApplications(data.applications)
      setTotalApplications(data.totalApplications)
    } catch (loadError) {
      setTotalApplications(0)
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load applications. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void loadApplications()
    })
  }, [loadApplications])

  async function confirmDelete() {
    if (!applicationToDelete || isDeleting) return

    setIsDeleting(true)
    try {
      await deleteApplication(applicationToDelete.id)
      setApplicationToDelete(null)
      toast.add({
        title: "Application cancelled",
        description: "Your application has been removed.",
      })
      await loadApplications()
    } catch (deleteError) {
      toast.add({
        title: "Error",
        description:
          deleteError instanceof Error
            ? deleteError.message
            : "Failed to cancel application.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl" aria-busy={isLoading}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
            Student dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Applications
          </h1>
          <p className="mt-1 text-sm font-medium text-brand-500">
            Total Applications: {totalApplications}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Track the tuition applications you have submitted and cancel any that are
            still pending.
          </p>
        </div>

        <Button
          render={<Link href="/tuitions" />}
          nativeButton={false}
          variant="outline"
          className="h-10"
        >
          <BookOpen aria-hidden />
          Browse tuitions
        </Button>
      </div>

      {isLoading ? (
        <LoadingGrid />
      ) : error ? (
        <div
          role="alert"
          className="rounded-3xl border border-rose-500/30 bg-rose-500/5 px-6 py-16 text-center"
        >
          <AlertCircle className="mx-auto size-7 text-rose-500" aria-hidden />
          <p className="mt-4 text-sm text-rose-600 dark:text-rose-400">{error}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadApplications()}
            >
              <RefreshCw aria-hidden />
              Retry
            </Button>
            {error.toLowerCase().includes("sign in") && (
              <Button
                render={<Link href="/sign-in" />}
                nativeButton={false}
                className="h-10 bg-brand-500 px-4 text-white hover:bg-brand-400"
              >
                Sign in
              </Button>
            )}
          </div>
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
            <Inbox className="size-7" aria-hidden />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            No applications yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            You have not applied to any tuition yet. Browse available tuitions and send
            your first application.
          </p>
          <Button
            render={<Link href="/tuitions" />}
            nativeButton={false}
            className="mt-6 h-10 bg-brand-500 px-4 text-white hover:bg-brand-400"
          >
            <BookOpen aria-hidden />
            Browse tuitions
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {applications.map((application) => (
            <article
              key={application.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-500/30 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2
                    className="truncate text-base font-semibold text-foreground"
                    title={application.tuitionTitle}
                  >
                    {application.tuitionTitle}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Applied on {formatDate(application.appliedDate)}
                  </p>
                </div>
                <StatusBadge status={application.status} />
              </div>

              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <MetaItem
                  icon={UserRound}
                  label="Tutor name"
                  value={application.tutorName}
                />
                <MetaItem icon={Mail} label="Tutor email" value={application.tutorEmail} />
                <MetaItem
                  icon={Wallet}
                  label="Monthly fee"
                  value={`৳${application.monthlyFee.toLocaleString("en-US")}`}
                />
                <MetaItem
                  icon={CalendarDays}
                  label="Applied date"
                  value={formatDate(application.appliedDate)}
                />
              </dl>

              {application.status === "pending" && (
                <div className="mt-5 flex justify-end border-t border-border pt-4">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setApplicationToDelete(application)}
                  >
                    <Trash2 aria-hidden />
                    Cancel application
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <AlertDialog
        open={applicationToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setApplicationToDelete(null)
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>Cancel this application?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove your application for{" "}
              <strong>{applicationToDelete?.tuitionTitle ?? "this tuition"}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" disabled={isDeleting}>
              Keep application
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
              ) : (
                <Trash2 aria-hidden />
              )}
              {isDeleting ? "Cancelling…" : "Cancel application"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

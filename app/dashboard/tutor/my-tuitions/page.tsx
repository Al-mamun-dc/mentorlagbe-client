"use client"

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import Link from "next/link"
import {
  BookOpen,
  CalendarDays,
  CircleCheck,
  CircleX,
  Clock3,
  Globe,
  Inbox,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  ToggleLeft,
  ToggleRight,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { gettution } from "@/lib/api/tution"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { DeleteTutionDialog } from "@/app/components/DeleteDialog"
import { deleteTution } from "@/lib/actions/post-tution"
import { toast } from "@/components/ui/toast"

/* --------------------------------- Types --------------------------------- */

type Mode = "online" | "offline"
type ApprovalStatus = "pending" | "approved" | "rejected"
type TutorStatus = "active" | "closed"

interface Tuition {
  _id: string
  id: string
  title: string
  subject: string
  classLevel: string
  mode: Mode
  location: string
  monthlyFee: number
  daysPerWeek: number
  description: string
  approvalStatus: ApprovalStatus
  tutorStatus: TutorStatus
}

/* The edit form keeps numbers as strings so the inputs stay easy to control. */
interface TuitionFormState {
  title: string
  subject: string
  classLevel: string
  mode: Mode
  location: string
  monthlyFee: string
  daysPerWeek: string
  description: string
}

type FormErrors = Partial<Record<keyof TuitionFormState, string>>

/* Raw record as it comes from MongoDB through the API. */
interface ApiTuition {
  _id?: unknown
  id?: unknown
  title?: unknown
  subject?: unknown
  classLevel?: unknown
  mode?: unknown
  location?: unknown
  monthlyFee?: unknown
  daysPerWeek?: unknown
  description?: unknown
  approvalStatus?: unknown
  tutorStatus?: unknown
}

function asText(value: unknown, fallback = "") {
  if (typeof value === "string") return value
  if (value === null || value === undefined) return fallback
  return String(value)
}

/* Maps an API record to the shape the existing cards and edit form expect. */
function normalizeTuition(raw: ApiTuition, index: number): Tuition {
  const mode: Mode = asText(raw.mode).toLowerCase() === "offline" ? "offline" : "online"
  const approval = asText(raw.approvalStatus).toLowerCase()
  const approvalStatus: ApprovalStatus =
    approval === "approved" || approval === "rejected" ? approval : "pending"
  const tutorStatus: TutorStatus =
    asText(raw.tutorStatus).toLowerCase() === "closed" ? "closed" : "active"

  const tuitionId = asText(raw._id ?? raw.id, `tuition-${index}`)

  return {
    _id: tuitionId,
    id: tuitionId,
    title: asText(raw.title),
    subject: asText(raw.subject),
    classLevel: asText(raw.classLevel),
    mode,
    location: mode === "online" ? "Online" : asText(raw.location),
    monthlyFee: Number(raw.monthlyFee) || 0,
    daysPerWeek: Number(raw.daysPerWeek) || 1,
    description: asText(raw.description),
    approvalStatus,
    tutorStatus,
  }
}

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Programming",
  "IELTS",
  "Chemistry",
  "Biology",
  "English",
]

const CLASS_LEVELS = [
  "Class 1–5",
  "Class 6–8",
  "Class 9–10",
  "Class 11–12",
  "Undergraduate",
  "Adults / Professional",
]

const DAYS_PER_WEEK = ["1", "2", "3", "4", "5", "6", "7"]

const SELECT_CLASS =
  "h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none transition-colors focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/25 [&>option]:bg-background"

/* ------------------------------ Small helpers ----------------------------- */

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
    className: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
}

function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  const style = approvalStyles[status]
  const Icon = status === "approved" ? CircleCheck : status === "rejected" ? CircleX : Clock3

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

/* --------------------------------- Component ------------------------------ */

export default function MyCreatedTuitionsPage() {
  /* Tuitions are loaded from the API; edits stay in frontend state for now. */
  const [tuitions, setTuitions] = useState<Tuition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingForm, setEditingForm] = useState<TuitionFormState | null>(null)
  const [editErrors, setEditErrors] = useState<FormErrors>({})

  useEffect(() => {
    let isMounted = true

    async function loadTuitions() {
      setIsLoading(true)
      setFetchError("")

      try {
        const result = (await gettution()) as unknown
        const list = Array.isArray(result)
          ? result
          : ((result as { tuitions?: unknown[]; data?: unknown[] } | null)?.tuitions ??
            (result as { data?: unknown[] } | null)?.data ??
            [])

        if (isMounted) {
          setTuitions(list.map((item, index) => normalizeTuition(item as ApiTuition, index)))
        }
      } catch {
        if (isMounted) setFetchError("Failed to load tuitions. Please try again later.")
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadTuitions()

    return () => {
      isMounted = false
    }
  }, [])

  const counts = {
    total: tuitions.length,
    pending: tuitions.filter((item) => item.approvalStatus === "pending").length,
    approved: tuitions.filter((item) => item.approvalStatus === "approved").length,
    rejected: tuitions.filter((item) => item.approvalStatus === "rejected").length,
  }

  function openEditor(tuition: Tuition) {
    setEditingId(tuition.id)
    setEditingForm({
      title: tuition.title,
      subject: tuition.subject,
      classLevel: tuition.classLevel,
      mode: tuition.mode,
      location: tuition.location === "Online" ? "" : tuition.location,
      monthlyFee: String(tuition.monthlyFee),
      daysPerWeek: String(tuition.daysPerWeek),
      description: tuition.description,
    })
    setEditErrors({})
  }

  function closeEditor() {
    setEditingId(null)
    setEditingForm(null)
    setEditErrors({})
  }

  function handleEditChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target
    setEditingForm((current) =>
      current ? { ...current, [name]: value } : current
    )
    setEditErrors((current) => ({ ...current, [name]: undefined }))
  }

  function handleEditModeChange(mode: Mode) {
    setEditingForm((current) => (current ? { ...current, mode } : current))
    setEditErrors((current) => ({
      ...current,
      mode: undefined,
      ...(mode === "online" ? { location: undefined } : {}),
    }))
  }

  function validateEditForm(form: TuitionFormState): FormErrors {
    const errors: FormErrors = {}

    if (!form.title.trim()) errors.title = "Title is required."
    if (!form.subject) errors.subject = "Select a subject."
    if (!form.classLevel) errors.classLevel = "Select a class level."
    if (form.mode === "offline" && !form.location.trim()) {
      errors.location = "Location is required for offline tuitions."
    }

    const fee = Number(form.monthlyFee)
    if (!form.monthlyFee.trim()) {
      errors.monthlyFee = "Monthly fee is required."
    } else if (!Number.isFinite(fee) || fee <= 0) {
      errors.monthlyFee = "Monthly fee must be greater than 0."
    }

    const days = Number(form.daysPerWeek)
    if (!form.daysPerWeek) {
      errors.daysPerWeek = "Days per week is required."
    } else if (!Number.isInteger(days) || days < 1 || days > 7) {
      errors.daysPerWeek = "Days per week must be between 1 and 7."
    }

    if (!form.description.trim()) errors.description = "Description is required."

    return errors
  }

  function handleSaveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingForm || !editingId) return

    const errors = validateEditForm(editingForm)
    setEditErrors(errors)
    if (Object.keys(errors).length > 0) return

    const { monthlyFee, daysPerWeek, ...textFields } = editingForm

    /* Only the browser state changes here — no backend request is made. */
    setTuitions((current) =>
      current.map((item) =>
        item.id === editingId
          ? {
            ...item,
            ...textFields,
            location: textFields.mode === "online" ? "Online" : textFields.location.trim(),
            monthlyFee: Number(monthlyFee),
            daysPerWeek: Number(daysPerWeek),
          }
          : item
      )
    )
    closeEditor()
  }

  function toggleTutorStatus(id: string) {
    setTuitions((current) =>
      current.map((item) =>
        item.id === id
          ? {
            ...item,
            tutorStatus: item.tutorStatus === "active" ? "closed" : "active",
          }
          : item
      )
    )
  }

 async function handleDelete(id: string) {
  try {
    await deleteTution(id);

    setTuitions((current) =>
      current.filter((item) => item.id !== id)
    );

    toast.add({
      title: "Success",
      description: "Tuition deleted successfully!",
    });

  } catch (error) {
    console.error(error);

    toast.add({
      title: "Error",
      description:
        error instanceof Error
          ? error.message
          : "Failed to delete tuition.",
    });
  }
}
  return (
    <section className="mx-auto w-full max-w-6xl">
      {/* Heading */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
            Tutor dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Created Tuitions
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review, edit, and manage all the tuition listings you have created.
          </p>
        </div>

        <Button
          render={<Link href="/dashboard/tutor/post-tution" />}
          nativeButton={false}
          className="h-10 bg-brand-500 px-4 text-white hover:bg-brand-400"
        >
          <Plus aria-hidden />
          Post new tuition
        </Button>
      </div>

      {/* Summary counts */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total tuitions"
          value={counts.total}
          icon={BookOpen}
          iconClass="bg-brand-500/10 text-brand-500"
        />
        <StatCard
          label="Pending approval"
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

      {/* Loading, error, tuition cards or empty state */}
      {isLoading ? (
        <div className="rounded-3xl border border-border bg-card px-6 py-16 text-center">
          <LoaderCircle
            className="mx-auto size-7 animate-spin text-brand-500"
            aria-hidden
          />
          <p className="mt-4 text-sm text-muted-foreground">
            Loading your tuitions…
          </p>
        </div>
      ) : fetchError ? (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/5 px-6 py-16 text-center">
          <CircleX className="mx-auto size-7 text-rose-500" aria-hidden />
          <p role="alert" className="mt-4 text-sm text-rose-600 dark:text-rose-400">
            {fetchError}
          </p>
        </div>
      ) : tuitions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
            <Inbox className="size-7" aria-hidden />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            No tuitions yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            You have not created any tuition posts. Post your first tuition to
            start connecting with students.
          </p>
          <Button
            render={<Link href="/dashboard/tutor/post-tution" />}
            nativeButton={false}
            className="mt-6 h-10 bg-brand-500 px-4 text-white hover:bg-brand-400"
          >
            <Plus aria-hidden />
            Post a tuition
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tuitions.map((tuition) => {
            const isActive = tuition.tutorStatus === "active"

            return (
              <article
                key={tuition.id}
                className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-500/30 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2
                      className="truncate text-base font-semibold text-foreground"
                      title={tuition.title}
                    >
                      {tuition.title}
                    </h2>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <span className="rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-600 dark:text-brand-300">
                        {tuition.subject}
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                        {tuition.classLevel}
                      </span>
                    </div>
                  </div>
                  <ApprovalBadge status={tuition.approvalStatus} />
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4 text-sm">
                  <MetaItem
                    icon={tuition.mode === "online" ? Globe : MapPin}
                    label="Mode"
                    value={tuition.mode === "online" ? "Online" : "Offline"}
                  />
                  <MetaItem
                    icon={MapPin}
                    label="Location"
                    value={tuition.location}
                  />
                  <MetaItem
                    icon={Wallet}
                    label="Monthly fee"
                    value={`৳${tuition.monthlyFee.toLocaleString()}`}
                  />
                  <MetaItem
                    icon={CalendarDays}
                    label="Days per week"
                    value={`${tuition.daysPerWeek} ${tuition.daysPerWeek === 1 ? "day" : "days"}`}
                  />
                </dl>

                <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {tuition.description}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => toggleTutorStatus(tuition.id)}
                    aria-label={`Tuition is ${isActive ? "active" : "closed"}. Click to ${isActive ? "close" : "activate"} it.`}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:outline-none ${isActive
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-border bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {isActive ? (
                      <ToggleRight className="size-4" aria-hidden />
                    ) : (
                      <ToggleLeft className="size-4" aria-hidden />
                    )}
                    {isActive ? "Active" : "Closed"}
                  </button>

                  <div className="ml-auto flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditor(tuition)}
                    >
                      <Pencil aria-hidden />
                      Edit
                    </Button>
                    <DeleteTutionDialog
                      myTution={tuition}
                      onDelete={handleDelete}
                    />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Edit sheet */}
      <Sheet
        open={editingForm !== null}
        onOpenChange={(open) => {
          if (!open) closeEditor()
        }}
      >
        <SheetContent
          side="right"
          className="w-full overflow-y-auto bg-card sm:max-w-xl"
        >
          <SheetHeader>
            <SheetTitle>Edit tuition</SheetTitle>
            <SheetDescription>
              Update the details of this tuition listing. Changes are saved in
              this browser only for now.
            </SheetDescription>
          </SheetHeader>

          {editingForm && (
            <form
              onSubmit={handleSaveEdit}
              noValidate
              className="flex flex-1 flex-col gap-4 px-4 pb-6"
            >
              <div>
                <label htmlFor="edit-title" className="mb-1.5 block text-sm font-medium">
                  Title
                </label>
                <Input
                  id="edit-title"
                  name="title"
                  value={editingForm.title}
                  onChange={handleEditChange}
                  aria-invalid={!!editErrors.title}
                />
                {editErrors.title && (
                  <p role="alert" className="mt-1 text-xs text-destructive">
                    {editErrors.title}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="edit-subject" className="mb-1.5 block text-sm font-medium">
                    Subject
                  </label>
                  <select
                    id="edit-subject"
                    name="subject"
                    value={editingForm.subject}
                    onChange={handleEditChange}
                    className={SELECT_CLASS}
                  >
                    <option value="">Select a subject</option>
                    {SUBJECTS.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                  {editErrors.subject && (
                    <p role="alert" className="mt-1 text-xs text-destructive">
                      {editErrors.subject}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="edit-classLevel" className="mb-1.5 block text-sm font-medium">
                    Class level
                  </label>
                  <select
                    id="edit-classLevel"
                    name="classLevel"
                    value={editingForm.classLevel}
                    onChange={handleEditChange}
                    className={SELECT_CLASS}
                  >
                    <option value="">Select a class level</option>
                    {CLASS_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  {editErrors.classLevel && (
                    <p role="alert" className="mt-1 text-xs text-destructive">
                      {editErrors.classLevel}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-medium">Mode</span>
                <div className="grid grid-cols-2 gap-2">
                  {(["online", "offline"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={editingForm.mode === mode}
                      onClick={() => handleEditModeChange(mode)}
                      className={`h-9 rounded-lg border text-sm font-medium capitalize transition-colors ${editingForm.mode === mode
                        ? "border-brand-500/60 bg-brand-500/10 text-brand-600 dark:text-brand-300"
                        : "border-input bg-background text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {editingForm.mode === "offline" && (
                <div>
                  <label htmlFor="edit-location" className="mb-1.5 block text-sm font-medium">
                    Location
                  </label>
                  <Input
                    id="edit-location"
                    name="location"
                    value={editingForm.location}
                    onChange={handleEditChange}
                    placeholder="e.g. Dhanmondi, Dhaka"
                    aria-invalid={!!editErrors.location}
                  />
                  {editErrors.location && (
                    <p role="alert" className="mt-1 text-xs text-destructive">
                      {editErrors.location}
                    </p>
                  )}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="edit-monthlyFee" className="mb-1.5 block text-sm font-medium">
                    Monthly fee (৳)
                  </label>
                  <Input
                    id="edit-monthlyFee"
                    name="monthlyFee"
                    type="number"
                    min="1"
                    value={editingForm.monthlyFee}
                    onChange={handleEditChange}
                    aria-invalid={!!editErrors.monthlyFee}
                  />
                  {editErrors.monthlyFee && (
                    <p role="alert" className="mt-1 text-xs text-destructive">
                      {editErrors.monthlyFee}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="edit-daysPerWeek" className="mb-1.5 block text-sm font-medium">
                    Days per week
                  </label>
                  <select
                    id="edit-daysPerWeek"
                    name="daysPerWeek"
                    value={editingForm.daysPerWeek}
                    onChange={handleEditChange}
                    className={SELECT_CLASS}
                  >
                    <option value="">Select days</option>
                    {DAYS_PER_WEEK.map((day) => (
                      <option key={day} value={day}>
                        {day} {day === "1" ? "day" : "days"}
                      </option>
                    ))}
                  </select>
                  {editErrors.daysPerWeek && (
                    <p role="alert" className="mt-1 text-xs text-destructive">
                      {editErrors.daysPerWeek}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="edit-description" className="mb-1.5 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  rows={4}
                  value={editingForm.description}
                  onChange={handleEditChange}
                  className={`${SELECT_CLASS} h-auto min-h-24 resize-y py-2`}
                />
                {editErrors.description && (
                  <p role="alert" className="mt-1 text-xs text-destructive">
                    {editErrors.description}
                  </p>
                )}
              </div>

              <SheetFooter className="px-0 pt-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={closeEditor}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-500 text-white hover:bg-brand-400"
                >
                  Save changes
                </Button>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>

    </section>
  )
}
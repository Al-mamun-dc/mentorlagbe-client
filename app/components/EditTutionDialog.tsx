"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export type Mode = "online" | "offline"

/* The edit form keeps numbers as strings so the inputs stay easy to control. */
export interface TuitionFormState {
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

export interface EditableTuition {
  id: string
  title: string
  subject: string
  classLevel: string
  mode: Mode
  location: string
  monthlyFee: number
  daysPerWeek: number
  description: string
}

interface EditTutionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tuition: EditableTuition | null
  onSave: (id: string, form: TuitionFormState) => Promise<void> | void
}

/* Same dropdown options used by the Post Tuition form. */
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

function toFormState(tuition: EditableTuition | null): TuitionFormState {
  if (!tuition) {
    return {
      title: "",
      subject: "",
      classLevel: "",
      mode: "online",
      location: "",
      monthlyFee: "",
      daysPerWeek: "",
      description: "",
    }
  }

  return {
    title: tuition.title,
    subject: tuition.subject,
    classLevel: tuition.classLevel,
    mode: tuition.mode,
    location: tuition.location === "Online" ? "" : tuition.location,
    monthlyFee: String(tuition.monthlyFee),
    daysPerWeek: String(tuition.daysPerWeek),
    description: tuition.description,
  }
}

export function EditTutionDialog({
  open,
  onOpenChange,
  tuition,
  onSave,
}: EditTutionDialogProps) {
  const [form, setForm] = useState<TuitionFormState>(() => toFormState(tuition))
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSaving, setIsSaving] = useState(false)

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  function handleModeChange(mode: Mode) {
    setForm((current) => ({ ...current, mode }))
    setErrors((current) => ({
      ...current,
      mode: undefined,
      ...(mode === "online" ? { location: undefined } : {}),
    }))
  }

  function validateForm(values: TuitionFormState): FormErrors {
    const nextErrors: FormErrors = {}

    if (!values.title.trim()) nextErrors.title = "Title is required."
    if (!values.subject) nextErrors.subject = "Select a subject."
    if (!values.classLevel) nextErrors.classLevel = "Select a class level."
    if (values.mode === "offline" && !values.location.trim()) {
      nextErrors.location = "Location is required for offline tuitions."
    }

    const fee = Number(values.monthlyFee)
    if (!values.monthlyFee.trim()) {
      nextErrors.monthlyFee = "Monthly fee is required."
    } else if (!Number.isFinite(fee) || fee <= 0) {
      nextErrors.monthlyFee = "Monthly fee must be greater than 0."
    }

    const days = Number(values.daysPerWeek)
    if (!values.daysPerWeek) {
      nextErrors.daysPerWeek = "Days per week is required."
    } else if (!Number.isInteger(days) || days < 1 || days > 7) {
      nextErrors.daysPerWeek = "Days per week must be between 1 and 7."
    }

    if (!values.description.trim()) nextErrors.description = "Description is required."

    return nextErrors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!tuition || isSaving) return

    const nextErrors = validateForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSaving(true)
    try {
      await onSave(tuition.id, form)
    } catch {
      /* page.tsx shows the error toast and keeps this dialog open. */
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full overflow-y-auto bg-card sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit tuition</DialogTitle>
          <DialogDescription>
            Update the details of this tuition listing. Changes are saved to
            your account.
          </DialogDescription>
        </DialogHeader>

        {tuition && (
          <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col gap-4">
            <div>
              <label htmlFor="edit-title" className="mb-1.5 block text-sm font-medium">
                Title
              </label>
              <Input
                id="edit-title"
                name="title"
                value={form.title}
                onChange={handleChange}
                aria-invalid={!!errors.title}
                disabled={isSaving}
              />
              {errors.title && (
                <p role="alert" className="mt-1 text-xs text-destructive">
                  {errors.title}
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
                  value={form.subject}
                  onChange={handleChange}
                  className={SELECT_CLASS}
                  disabled={isSaving}
                >
                  <option value="">Select a subject</option>
                  {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
                {errors.subject && (
                  <p role="alert" className="mt-1 text-xs text-destructive">
                    {errors.subject}
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
                  value={form.classLevel}
                  onChange={handleChange}
                  className={SELECT_CLASS}
                  disabled={isSaving}
                >
                  <option value="">Select a class level</option>
                  {CLASS_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                {errors.classLevel && (
                  <p role="alert" className="mt-1 text-xs text-destructive">
                    {errors.classLevel}
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
                    aria-pressed={form.mode === mode}
                    disabled={isSaving}
                    onClick={() => handleModeChange(mode)}
                    className={`h-9 rounded-lg border text-sm font-medium capitalize transition-colors ${form.mode === mode
                      ? "border-brand-500/60 bg-brand-500/10 text-brand-600 dark:text-brand-300"
                      : "border-input bg-background text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {form.mode === "offline" && (
              <div>
                <label htmlFor="edit-location" className="mb-1.5 block text-sm font-medium">
                  Location
                </label>
                <Input
                  id="edit-location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Dhanmondi, Dhaka"
                  aria-invalid={!!errors.location}
                  disabled={isSaving}
                />
                {errors.location && (
                  <p role="alert" className="mt-1 text-xs text-destructive">
                    {errors.location}
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
                  value={form.monthlyFee}
                  onChange={handleChange}
                  aria-invalid={!!errors.monthlyFee}
                  disabled={isSaving}
                />
                {errors.monthlyFee && (
                  <p role="alert" className="mt-1 text-xs text-destructive">
                    {errors.monthlyFee}
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
                  value={form.daysPerWeek}
                  onChange={handleChange}
                  className={SELECT_CLASS}
                  disabled={isSaving}
                >
                  <option value="">Select days</option>
                  {DAYS_PER_WEEK.map((day) => (
                    <option key={day} value={day}>
                      {day} {day === "1" ? "day" : "days"}
                    </option>
                  ))}
                </select>
                {errors.daysPerWeek && (
                  <p role="alert" className="mt-1 text-xs text-destructive">
                    {errors.daysPerWeek}
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
                value={form.description}
                onChange={handleChange}
                className={`${SELECT_CLASS} h-auto min-h-24 resize-y py-2`}
                disabled={isSaving}
              />
              {errors.description && (
                <p role="alert" className="mt-1 text-xs text-destructive">
                  {errors.description}
                </p>
              )}
            </div>

            <DialogFooter className="px-0 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-brand-500 text-white hover:bg-brand-400"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" aria-hidden />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

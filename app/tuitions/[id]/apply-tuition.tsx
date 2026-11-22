"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { CheckCircle2, Info, LoaderCircle, Send } from "lucide-react"

import { applyToTuition } from "@/lib/api/tution"
import { useSession } from "@/lib/auth-client"
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

type Role = "student" | "tutor" | "admin"

const INPUT_CLASS =
  "h-10 rounded-xl border-white/10 bg-white/5 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:border-brand-400/60 focus-visible:ring-2 focus-visible:ring-brand-400/30"

const NOTICE_CLASS =
  "mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-zinc-400"

export function ApplyTuitionCard({
  tuitionId,
  tuitionTitle,
}: {
  tuitionId: string
  tuitionTitle: string
}) {
  const { data: session, isPending } = useSession()
  const role = session?.user?.role as Role | undefined

  const [dialogOpen, setDialogOpen] = useState(false)
  const [phone, setPhone] = useState("")
  const [preferredSchedule, setPreferredSchedule] = useState("")
  const [learningNote, setLearningNote] = useState("")
  const [formError, setFormError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const trimmedPhone = phone.trim()
    const trimmedSchedule = preferredSchedule.trim()
    const trimmedNote = learningNote.trim()

    if (!trimmedPhone) {
      setFormError("Phone is required.")
      return
    }
    if (!trimmedSchedule) {
      setFormError("Preferred schedule is required.")
      return
    }

    setFormError("")
    setIsSubmitting(true)

    try {
      await applyToTuition(tuitionId, {
        phone: trimmedPhone,
        preferredSchedule: trimmedSchedule,
        learningNote: trimmedNote,
      })

      setDialogOpen(false)
      setSuccessMessage("Application submitted successfully. Your application is now pending review.")
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to submit application.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session?.user) {
    if (isPending) {
      return (
        <div className={NOTICE_CLASS} aria-live="polite">
          <span className="inline-flex items-center gap-2">
            <LoaderCircle className="size-3.5 animate-spin text-brand-400" aria-hidden />
            Checking your access…
          </span>
        </div>
      )
    }

    return (
      <div className={NOTICE_CLASS}>
        <p className="flex items-start gap-2">
          <Info className="mt-0.5 size-4 shrink-0 text-brand-400" aria-hidden />
          <span>Sign in as a student to apply for this tuition.</span>
        </p>
        <Link
          href="/sign-in"
          className="mt-3 inline-flex h-9 items-center justify-center rounded-xl bg-brand-500 px-4 text-xs font-medium text-white transition-colors hover:bg-brand-400 focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none"
        >
          Sign in
        </Link>
      </div>
    )
  }

  if (role !== "student") {
    return (
      <div className={NOTICE_CLASS}>
        <p className="flex items-start gap-2">
          <Info className="mt-0.5 size-4 shrink-0 text-amber-400" aria-hidden />
          <span>Only students can apply for tuition.</span>
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 border-t border-white/10 pt-6">
      <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
        Apply for this tuition
      </h3>

      {successMessage ? (
        <div className="mt-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
            <CheckCircle2 className="size-4 shrink-0" aria-hidden />
            Application submitted
          </p>
          <p className="mt-2 text-xs leading-relaxed text-emerald-200/80">{successMessage}</p>
        </div>
      ) : (
        <>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">
            Interested in learning with this tutor? Send your details and they will review your
            application.
          </p>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-sm font-semibold text-white transition-colors hover:bg-brand-400 focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none"
          >
            <Send className="size-4" aria-hidden />
            Apply Now
          </button>
        </>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!isSubmitting) setDialogOpen(open)
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border border-white/10 bg-ink-900 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Apply for tuition</DialogTitle>
            <DialogDescription className="line-clamp-2 text-zinc-400">
              {tuitionTitle}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            <div>
              <label htmlFor="application-phone" className="mb-1.5 block text-xs font-medium text-zinc-300">
                Phone <span className="text-rose-400">*</span>
              </label>
              <Input
                id="application-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Your phone number"
                autoComplete="tel"
                maxLength={50}
                disabled={isSubmitting}
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label
                htmlFor="application-schedule"
                className="mb-1.5 block text-xs font-medium text-zinc-300"
              >
                Preferred Schedule <span className="text-rose-400">*</span>
              </label>
              <Input
                id="application-schedule"
                value={preferredSchedule}
                onChange={(event) => setPreferredSchedule(event.target.value)}
                placeholder="e.g. Friday evening, 6:00 PM"
                maxLength={200}
                disabled={isSubmitting}
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label
                htmlFor="application-note"
                className="mb-1.5 block text-xs font-medium text-zinc-300"
              >
                Learning Note <span className="font-normal text-zinc-500">(optional)</span>
              </label>
              <textarea
                id="application-note"
                value={learningNote}
                onChange={(event) => setLearningNote(event.target.value)}
                placeholder="Tell the tutor about your learning goals"
                maxLength={2000}
                rows={4}
                disabled={isSubmitting}
                className={`${INPUT_CLASS} h-auto resize-none py-2.5`}
              />
            </div>

            {formError && (
              <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {formError}
              </p>
            )}

            <DialogFooter className="border-white/10 bg-transparent px-0 pt-2 sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
                className="text-zinc-300 hover:bg-white/10 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-500 text-white hover:bg-brand-400"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" aria-hidden />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send className="size-4" aria-hidden />
                    Submit application
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

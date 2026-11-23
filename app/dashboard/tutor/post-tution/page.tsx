"use client"

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react"
import {
  BookOpen,
  CalendarDays,
  CircleCheck,
  Globe,
  ImagePlus,
  Info,
  LoaderCircle,
  MapPin,
  Upload,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { posttution } from "@/lib/actions/post-tution"
import { toast } from "@/components/ui/toast"

type Mode = "online" | "offline"

interface TuitionFormState {
  title: string
  subject: string
  classLevel: string
  mode: Mode
  location: string
  monthlyFee: string
  daysPerWeek: string
  description: string
  bannerImage: string
}

type FormErrors = Partial<Record<keyof TuitionFormState, string>>

interface ImgbbResponse {
  data?: {
    url: string
    display_url?: string
  }
  error?: {
    message?: string
    code?: number
  }
  status_txt?: string
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

const INITIAL_FORM: TuitionFormState = {
  title: "",
  subject: "",
  classLevel: "",
  mode: "online",
  location: "",
  monthlyFee: "",
  daysPerWeek: "",
  description: "",
  bannerImage: "",
}

/* Shared input look so native select/textarea match the shadcn Input. */
const controlClass =
  "flex h-10 w-full rounded-xl border border-white/10 bg-ink-950/60 px-3 text-sm text-white placeholder:text-zinc-600 transition-colors focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/25 focus:outline-none aria-[invalid=true]:border-red-500/60 [&>option]:bg-ink-900"

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-medium text-zinc-200"
      >
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

export default function PostTuitionPage() {
  const [form, setForm] = useState<TuitionFormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [previewUrl, setPreviewUrl] = useState("")
  const [uploadError, setUploadError] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [statusError, setStatusError] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)

  /* Clean up the temporary local image URL when the page unmounts. */
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setStatusMessage("")
    setStatusError(false)
  }

  function handleModeChange(mode: Mode) {
    setForm((current) => ({ ...current, mode }))
    setErrors((current) => ({
      ...current,
      mode: undefined,
      ...(mode === "online" ? { location: undefined } : {}),
    }))
    setStatusMessage("")
    setStatusError(false)
  }

  function handleRemoveImage() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
    setPreviewUrl("")
    setUploadError("")
    setForm((current) => ({ ...current, bannerImage: "" }))
    setErrors((current) => ({ ...current, bannerImage: undefined }))
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadError("")
    setStatusMessage("")
    setStatusError(false)

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be smaller than 5 MB.")
      return
    }

    /* Show a local preview immediately while the upload is running. */
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const localUrl = URL.createObjectURL(file)
    objectUrlRef.current = localUrl
    setPreviewUrl(localUrl)

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY
    if (!apiKey || apiKey.startsWith("your_") || apiKey.startsWith("YOUR_")) {
      /* Let the user pick the same file again after fixing the key. */
      if (fileInputRef.current) fileInputRef.current.value = ""
      setUploadError(
        "ImgBB API key is not configured. Replace NEXT_PUBLIC_IMGBB_API_KEY in .env with your real key from https://api.imgbb.com/, then restart the dev server."
      )
      return
    }

    setIsUploading(true)

    try {
      /* ImgBB expects the key and the file as form fields — send them once. */
      const body = new FormData()
      body.append("key", apiKey)
      body.append("image", file)

      const response = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body,
      })

      let result: ImgbbResponse
      try {
        result = await response.json()
      } catch {
        throw new Error(
          `Image upload failed (HTTP ${response.status}). Please try again.`
        )
      }

      if (!response.ok || !result.data?.url) {
        if (result.error?.code === 100) {
          throw new Error(
            "ImgBB rejected the API key. Check NEXT_PUBLIC_IMGBB_API_KEY in .env and restart the dev server."
          )
        }
        throw new Error(
          result.error?.message ||
            result.status_txt ||
            `Image upload failed (HTTP ${response.status}). Please try again.`
        )
      }

      const uploadedUrl = result.data.url

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }

      setPreviewUrl(result.data.display_url || uploadedUrl)
      setForm((current) => ({ ...current, bannerImage: uploadedUrl }))
      setErrors((current) => ({ ...current, bannerImage: undefined }))
    } catch (error) {
      /* Reset the picker and stale preview so the same file can be retried. */
      if (fileInputRef.current) fileInputRef.current.value = ""
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
      setPreviewUrl("")
      setUploadError(
        error instanceof Error ? error.message : "Image upload failed. Please try again."
      )
      setForm((current) => ({ ...current, bannerImage: "" }))
    } finally {
      setIsUploading(false)
    }
  }

  function validateForm(): FormErrors {
    const nextErrors: FormErrors = {}

    if (!form.title.trim()) nextErrors.title = "Title is required."

    if (!form.subject) nextErrors.subject = "Select a subject."

    if (!form.classLevel) nextErrors.classLevel = "Select a class level."

    if (!form.mode) nextErrors.mode = "Choose a tuition mode."

    if (form.mode === "offline" && !form.location.trim()) {
      nextErrors.location = "Location is required for offline tuitions."
    }

    const fee = Number(form.monthlyFee)
    if (!form.monthlyFee.trim()) {
      nextErrors.monthlyFee = "Monthly fee is required."
    } else if (!Number.isFinite(fee) || fee <= 0) {
      nextErrors.monthlyFee = "Monthly fee must be greater than 0."
    }

    const days = Number(form.daysPerWeek)
    if (!form.daysPerWeek) {
      nextErrors.daysPerWeek = "Days per week is required."
    } else if (!Number.isInteger(days) || days < 1 || days > 7) {
      nextErrors.daysPerWeek = "Days per week must be between 1 and 7."
    }

    if (!form.description.trim()) {
      nextErrors.description = "Description is required."
    }

    if (!form.bannerImage) {
      nextErrors.bannerImage = uploadError
        ? "Upload a banner image to continue."
        : "Banner image is required."
    }

    return nextErrors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()

  const nextErrors = validateForm()
  setErrors(nextErrors)
  setStatusMessage("")
  setStatusError(false)

  if (Object.keys(nextErrors).length > 0) return

  setIsSubmitting(true)

  try {
    await posttution(form)

    toast.add({
      type: "success",
      title: "Tuition posted",
      description: "Tuition posted successfully!",
    })

  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to post tuition."

    toast.add({
      type: "error",
      title: "Error",
      description: message,
    })

  } finally {
    setIsSubmitting(false)
  }
}
  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Post a Tuition
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Create a listing to connect with students looking for your subject.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-charcoal p-6 shadow-2xl shadow-black/30 sm:p-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          {/* Tuition details */}
          <div>
            <div className="mb-5 flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-brand-500/15 text-brand-400">
                <BookOpen className="size-4" aria-hidden />
              </span>
              <h2 className="text-base font-semibold text-white">
                Tuition details
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field label="Title" htmlFor="title" error={errors.title}>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="e.g. Higher Secondary Mathematics"
                    value={form.title}
                    onChange={handleChange}
                    aria-invalid={!!errors.title}
                  />
                </Field>
              </div>

              <Field label="Subject" htmlFor="subject" error={errors.subject}>
                <select
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  aria-invalid={!!errors.subject}
                  className={controlClass}
                >
                  <option value="">Select a subject</option>
                  {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Class Level"
                htmlFor="classLevel"
                error={errors.classLevel}
              >
                <select
                  id="classLevel"
                  name="classLevel"
                  value={form.classLevel}
                  onChange={handleChange}
                  aria-invalid={!!errors.classLevel}
                  className={controlClass}
                >
                  <option value="">Select a class level</option>
                  {CLASS_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-zinc-200">
                  Mode
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {(["online", "offline"] as const).map((mode) => {
                    const selected = form.mode === mode
                    const Icon = mode === "online" ? Globe : MapPin

                    return (
                      <button
                        key={mode}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => handleModeChange(mode)}
                        className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none ${
                          selected
                            ? "border-brand-500/60 bg-brand-500/10 text-brand-300"
                            : "border-white/10 bg-ink-950/60 text-zinc-400 hover:border-white/25 hover:text-white"
                        }`}
                      >
                        <Icon className="size-4" aria-hidden />
                        {mode === "online" ? "Online" : "Offline"}
                      </button>
                    )
                  })}
                </div>
                {errors.mode && (
                  <p role="alert" className="mt-1.5 text-xs text-red-400">
                    {errors.mode}
                  </p>
                )}
              </div>

              {form.mode === "offline" && (
                <div className="md:col-span-2">
                  <Field
                    label="Location"
                    htmlFor="location"
                    error={errors.location}
                  >
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="e.g. Dhanmondi, Dhaka"
                      value={form.location}
                      onChange={handleChange}
                      aria-invalid={!!errors.location}
                    />
                  </Field>
                </div>
              )}
            </div>
          </div>

          {/* Schedule & pricing */}
          <div className="border-t border-white/10 pt-8">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-brand-500/15 text-brand-400">
                <CalendarDays className="size-4" aria-hidden />
              </span>
              <h2 className="text-base font-semibold text-white">
                Schedule &amp; pricing
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Monthly Fee (৳)"
                htmlFor="monthlyFee"
                error={errors.monthlyFee}
              >
                <Input
                  id="monthlyFee"
                  name="monthlyFee"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 4500"
                  value={form.monthlyFee}
                  onChange={handleChange}
                  aria-invalid={!!errors.monthlyFee}
                />
              </Field>

              <Field
                label="Days per Week"
                htmlFor="daysPerWeek"
                error={errors.daysPerWeek}
              >
                <select
                  id="daysPerWeek"
                  name="daysPerWeek"
                  value={form.daysPerWeek}
                  onChange={handleChange}
                  aria-invalid={!!errors.daysPerWeek}
                  className={controlClass}
                >
                  <option value="">Select days per week</option>
                  {DAYS_PER_WEEK.map((day) => (
                    <option key={day} value={day}>
                      {day} {day === "1" ? "day" : "days"}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-white/10 pt-8">
            <Field
              label="Description"
              htmlFor="description"
              error={errors.description}
            >
              <textarea
                id="description"
                name="description"
                rows={5}
                placeholder="Describe your teaching style, the syllabus you cover, and who this tuition is for."
                value={form.description}
                onChange={handleChange}
                aria-invalid={!!errors.description}
                className={`${controlClass} h-auto min-h-32 resize-y py-2.5`}
              />
            </Field>
          </div>

          {/* Banner image */}
          <div className="border-t border-white/10 pt-8">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-brand-500/15 text-brand-400">
                <ImagePlus className="size-4" aria-hidden />
              </span>
              <h2 className="text-base font-semibold text-white">Banner image</h2>
            </div>

            <input
              ref={fileInputRef}
              id="bannerImage"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleImageChange}
              disabled={isUploading}
            />

            <label
              htmlFor="bannerImage"
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-8 text-center transition-colors ${
                isUploading
                  ? "border-brand-500/50 bg-brand-500/5"
                  : "border-white/15 bg-ink-950/40 hover:border-brand-500/50 hover:bg-brand-500/5"
              }`}
            >
              {isUploading ? (
                <LoaderCircle
                  className="size-7 animate-spin text-brand-400"
                  aria-hidden
                />
              ) : (
                <Upload className="size-7 text-brand-400" aria-hidden />
              )}
              <span className="mt-3 text-sm font-medium text-white">
                {isUploading ? "Uploading image..." : "Click to choose an image"}
              </span>
              <span className="mt-1 text-xs text-zinc-500">
                PNG, JPG or WEBP · up to 5 MB
              </span>
            </label>

            {uploadError && (
              <p role="alert" className="mt-2 text-xs text-red-400">
                {uploadError}
              </p>
            )}
            {errors.bannerImage && !uploadError && (
              <p role="alert" className="mt-2 text-xs text-red-400">
                {errors.bannerImage}
              </p>
            )}

            {previewUrl && (
              <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/10">
                {/* Local blob URL or the ImgBB URL — both are safe image sources. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Selected tuition banner preview"
                  className="h-56 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  aria-label="Remove banner image"
                  className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-black/70 text-white transition-colors hover:bg-brand-500 focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none"
                >
                  <X className="size-4" aria-hidden />
                </button>
                {form.bannerImage && (
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-[11px] font-medium text-brand-300">
                    <CircleCheck className="size-3.5" aria-hidden />
                    Uploaded to ImgBB
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
            {statusMessage ? (
              <p
                role={statusError ? "alert" : "status"}
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
                  statusError
                    ? "border-red-500/30 bg-red-500/10 text-red-300"
                    : "border-brand-500/30 bg-brand-500/10 text-brand-300"
                }`}
              >
                <Info className="size-4 shrink-0" aria-hidden />
                {statusMessage}
              </p>
            ) : (
              <p className="text-xs text-zinc-500">
                All fields marked above are required.
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isUploading || isSubmitting}
              className="h-11 shrink-0 bg-brand-500 px-6 text-white hover:bg-brand-400 disabled:opacity-60"
            >
              {isUploading ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden />
                  Uploading...
                </>
              ) : isSubmitting ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden />
                  Posting...
                </>
              ) : (
                "Post Tuition"
              )}
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}

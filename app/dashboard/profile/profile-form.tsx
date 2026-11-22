"use client"

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import {
  CircleCheck,
  ImagePlus,
  Info,
  LoaderCircle,
  Upload,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import type { Profile } from "@/lib/profile"

interface FormState {
  name: string
  phone: string
  bio: string
  image: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

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

const controlClass =
  "flex h-10 w-full rounded-xl border border-white/10 bg-ink-950/60 px-3 text-sm text-white placeholder:text-zinc-600 transition-colors focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/25 focus:outline-none aria-[invalid=true]:border-red-500/60"

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
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
      {hint && !error ? (
        <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>
      ) : null}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "U"
}

export default function ProfileForm({
  initialProfile,
}: {
  initialProfile: Profile
}) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({
    name: initialProfile.name,
    phone: initialProfile.phone,
    bio: initialProfile.bio,
    image: initialProfile.image,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [localPreview, setLocalPreview] = useState("")
  const [uploadError, setUploadError] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [statusError, setStatusError] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  const previewUrl = localPreview || form.image

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setStatusMessage("")
    setStatusError(false)
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

    /* Preview the selected file immediately while ImgBB uploads it. */
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const objectUrl = URL.createObjectURL(file)
    objectUrlRef.current = objectUrl
    setLocalPreview(objectUrl)

    /* Reuse the project's existing ImgBB integration and API key. */
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY
    if (!apiKey || apiKey.startsWith("your_") || apiKey.startsWith("YOUR_")) {
      if (fileInputRef.current) fileInputRef.current.value = ""
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
      setLocalPreview("")
      setUploadError(
        "ImgBB API key is not configured. Set NEXT_PUBLIC_IMGBB_API_KEY in .env and restart the dev server."
      )
      return
    }

    setIsUploading(true)
    try {
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
      setLocalPreview("")
      setForm((current) => ({ ...current, image: uploadedUrl }))
      setErrors((current) => ({ ...current, image: undefined }))
    } catch (error) {
      if (fileInputRef.current) fileInputRef.current.value = ""
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
      setLocalPreview("")
      setUploadError(
        error instanceof Error
          ? error.message
          : "Image upload failed. Please try again."
      )
    } finally {
      setIsUploading(false)
    }
  }

  function handleRemoveImage() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
    setLocalPreview("")
    setUploadError("")
    setForm((current) => ({ ...current, image: "" }))
    setErrors((current) => ({ ...current, image: undefined }))
  }

  function validateForm(): FormErrors {
    const nextErrors: FormErrors = {}

    if (!form.name.trim()) nextErrors.name = "Name is required."
    else if (form.name.trim().length > 100) {
      nextErrors.name = "Name must be 100 characters or fewer."
    }

    if (form.phone.trim().length > 50) {
      nextErrors.phone = "Phone must be 50 characters or fewer."
    } else if (form.phone.trim() && !/^[0-9+\-()\s]+$/.test(form.phone.trim())) {
      nextErrors.phone = "Use only digits, spaces, +, - and parentheses."
    }

    if (form.bio.trim().length > 500) {
      nextErrors.bio = "Bio must be 500 characters or fewer."
    }

    if (form.image.trim()) {
      try {
        const url = new URL(form.image.trim())
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          nextErrors.image = "Use an http(s) image URL."
        }
      } catch {
        nextErrors.image = "Enter a valid image URL."
      }
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

    setIsSaving(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      })

      const text = await response.text()
      let result: { profile?: Profile; error?: string } = {}
      try {
        result = text ? JSON.parse(text) : {}
      } catch {
        /* handled below via the missing profile check */
      }

      if (!response.ok || !result.profile) {
        throw new Error(
          result.error || `Failed to save profile. (HTTP ${response.status})`
        )
      }

      setForm({
        name: result.profile.name,
        phone: result.profile.phone,
        bio: result.profile.bio,
        image: result.profile.image,
      })
      setStatusMessage("Profile updated successfully.")
      toast.add({
        title: "Success",
        description: "Your profile has been updated.",
      })
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save profile."
      setStatusError(true)
      setStatusMessage(message)
      toast.add({ title: "Error", description: message })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <div>
        <div className="mb-5 flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-brand-500/15 text-brand-400">
            <ImagePlus className="size-4" aria-hidden />
          </span>
          <h2 className="text-base font-semibold text-white">Profile picture</h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
          <div className="flex items-center gap-4">
            <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 bg-ink-950/60 text-2xl font-bold text-white">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Profile picture preview"
                  className="size-full object-cover"
                />
              ) : (
                <span className="bg-gradient-to-br from-brand-400 to-brand-600 bg-clip-text text-transparent">
                  {initials(form.name)}
                </span>
              )}
            </div>
            {previewUrl ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleRemoveImage}
                disabled={isUploading || isSaving}
                aria-label="Remove profile picture"
                className="size-9 rounded-full border-white/15 text-zinc-300 hover:text-white"
              >
                <X className="size-4" aria-hidden />
              </Button>
            ) : null}
          </div>

          <div className="space-y-4">
            <input
              ref={fileInputRef}
              id="profileImageFile"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleImageChange}
              disabled={isUploading || isSaving}
            />
            <label
              htmlFor="profileImageFile"
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-6 text-center transition-colors ${
                isUploading
                  ? "border-brand-500/50 bg-brand-500/5"
                  : "border-white/15 bg-ink-950/40 hover:border-brand-500/50 hover:bg-brand-500/5"
              }`}
            >
              {isUploading ? (
                <LoaderCircle
                  className="size-6 animate-spin text-brand-400"
                  aria-hidden
                />
              ) : (
                <Upload className="size-6 text-brand-400" aria-hidden />
              )}
              <span className="mt-2 text-sm font-medium text-white">
                {isUploading ? "Uploading image..." : "Click to upload an image"}
              </span>
              <span className="mt-1 text-xs text-zinc-500">
                PNG, JPG or WEBP · up to 5 MB
              </span>
            </label>

            <Field
              label="Or paste an image URL"
              htmlFor="image"
              error={errors.image}
              hint="A direct https:// link to your profile photo also works."
            >
              <Input
                id="image"
                name="image"
                type="url"
                inputMode="url"
                placeholder="https://example.com/photo.jpg"
                value={form.image}
                onChange={handleChange}
                aria-invalid={!!errors.image}
                disabled={isUploading || isSaving}
                className={controlClass}
              />
            </Field>

            {uploadError ? (
              <p role="alert" className="text-xs text-red-400">
                {uploadError}
              </p>
            ) : null}
            {!uploadError && form.image && !localPreview ? (
              <p className="flex items-center gap-1.5 text-xs text-brand-300">
                <CircleCheck className="size-3.5" aria-hidden />
                Image ready to save
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-8">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-brand-500/15 text-brand-400">
            <Info className="size-4" aria-hidden />
          </span>
          <h2 className="text-base font-semibold text-white">
            Personal information
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Name" htmlFor="name" error={errors.name}>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              aria-invalid={!!errors.name}
              disabled={isSaving}
              className={controlClass}
            />
          </Field>

          <Field
            label="Phone"
            htmlFor="phone"
            error={errors.phone}
            hint="Optional"
          >
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="Your phone number"
              value={form.phone}
              onChange={handleChange}
              aria-invalid={!!errors.phone}
              disabled={isSaving}
              className={controlClass}
            />
          </Field>

          <div className="md:col-span-2">
            <Field
              label="Bio"
              htmlFor="bio"
              error={errors.bio}
              hint="Optional · tell students or tutors a little about yourself."
            >
              <textarea
                id="bio"
                name="bio"
                rows={5}
                placeholder="A short introduction..."
                value={form.bio}
                onChange={handleChange}
                aria-invalid={!!errors.bio}
                disabled={isSaving}
                className={`${controlClass} h-auto min-h-32 resize-y py-2.5`}
              />
            </Field>
          </div>
        </div>
      </div>

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
            Only you can update your profile. Your email, role and plan stay
            unchanged.
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isUploading || isSaving}
          className="h-11 shrink-0 bg-brand-500 px-6 text-white hover:bg-brand-400 disabled:opacity-60"
        >
          {isSaving ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  )
}

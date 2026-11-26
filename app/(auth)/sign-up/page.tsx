"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type ChangeEvent, type FormEvent } from "react"
import { BookOpen, Eye, EyeOff, GraduationCap, Lock, Mail, UserRound } from "lucide-react"

import { BrandMark, BrandWordmark } from "@/components/navbar"
import { authClient } from "@/lib/auth-client"
import { toast } from "@/components/ui/toast"

type SignUpRole = "student" | "tutor"

interface SignUpForm {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  role: SignUpRole
}

export default function SignUpPage() {
  const router = useRouter()
  const [form, setForm] = useState<SignUpForm>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    if (name === "role") {
      const role: SignUpRole = value === "tutor" ? "tutor" : "student"
      setForm((current) => ({ ...current, role }))
      setError("")
      return
    }
    setForm((current) => ({ ...current, [name]: value }))
    setError("")
  }

  function handleTogglePassword() {
    setShowPassword((visible) => !visible)
  }

  function handleToggleConfirmPassword() {
    setShowConfirmPassword((visible) => !visible)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)

    const role: SignUpRole = form.role === "tutor" ? "tutor" : "student"
    const { error: signUpError } = await authClient.signUp.email({
      name: form.fullName,
      email: form.email,
      password: form.password,
      // Admin plugin blocks setting `role` directly (input:false). `signupAs`
      // is a declared additional field; server hook validates and maps to role.
      signupAs: role,
    } as Parameters<typeof authClient.signUp.email>[0] & { signupAs: SignUpRole })

    setIsLoading(false)

    if (signUpError) {
      setError(signUpError.message ?? "Could not create your account.")
      return
    }

    toast.add({ type: "success", title: "Account created", description: "Welcome to MentorLagbe!" })
    router.push("/")
    router.refresh()
  }

  return (
    <section className="flex min-h-[calc(100vh-16rem)] items-center justify-center px-3 py-8 sm:px-5 sm:py-12">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#252831] shadow-2xl shadow-black/30">
        <div className="px-6 py-10 sm:px-10 sm:py-12">
          <Link
            href="/"
            aria-label="MentorLagbe — home"
            className="inline-flex items-center gap-2.5 rounded-xl focus-visible:ring-2 focus-visible:ring-[#FF2D83]/60 focus-visible:outline-none"
          >
            <BrandMark className="size-9" />
            <BrandWordmark className="text-lg" />
          </Link>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Enter your details below to get started.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-zinc-200"
              >
                Full Name
              </label>
              <div className="relative mt-2">
                <UserRound
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-500"
                  aria-hidden
                />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Your full name"
                  value={form.fullName}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-white/10 bg-ink-950/60 pr-4 pl-11 text-sm text-white placeholder:text-zinc-600 transition-all duration-200 focus:border-[#FF2D83]/60 focus:ring-2 focus:ring-[#FF2D83]/25 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-200"
              >
                Email
              </label>
              <div className="relative mt-2">
                <Mail
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-500"
                  aria-hidden
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-white/10 bg-ink-950/60 pr-4 pl-11 text-sm text-white placeholder:text-zinc-600 transition-all duration-200 focus:border-[#FF2D83]/60 focus:ring-2 focus:ring-[#FF2D83]/25 focus:outline-none"
                />
              </div>
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-zinc-200">
                I am signing up as
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-[#FF2D83]/25 ${
                    form.role === "student"
                      ? "border-[#FF2D83]/60 bg-[#FF2D83]/10 text-white"
                      : "border-white/10 bg-ink-950/60 text-zinc-300 hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={form.role === "student"}
                    onChange={handleChange}
                    required
                    className="sr-only"
                  />
                  <GraduationCap className="size-4 shrink-0 text-[#FF2D83]" aria-hidden />
                  <span className="font-medium">Student</span>
                </label>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-[#FF2D83]/25 ${
                    form.role === "tutor"
                      ? "border-[#FF2D83]/60 bg-[#FF2D83]/10 text-white"
                      : "border-white/10 bg-ink-950/60 text-zinc-300 hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="tutor"
                    checked={form.role === "tutor"}
                    onChange={handleChange}
                    required
                    className="sr-only"
                  />
                  <BookOpen className="size-4 shrink-0 text-[#FF2D83]" aria-hidden />
                  <span className="font-medium">Tutor</span>
                </label>
              </div>
            </fieldset>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-200"
              >
                Password
              </label>
              <div className="relative mt-2">
                <Lock
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-500"
                  aria-hidden
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-white/10 bg-ink-950/60 pr-12 pl-11 text-sm text-white placeholder:text-zinc-600 transition-all duration-200 focus:border-[#FF2D83]/60 focus:ring-2 focus:ring-[#FF2D83]/25 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleTogglePassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-zinc-500 transition-colors hover:text-[#FF2D83] focus-visible:ring-2 focus-visible:ring-[#FF2D83]/60 focus-visible:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden />
                  ) : (
                    <Eye className="size-4" aria-hidden />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-zinc-200"
              >
                Confirm Password
              </label>
              <div className="relative mt-2">
                <Lock
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-500"
                  aria-hidden
                />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-white/10 bg-ink-950/60 pr-12 pl-11 text-sm text-white placeholder:text-zinc-600 transition-all duration-200 focus:border-[#FF2D83]/60 focus:ring-2 focus:ring-[#FF2D83]/25 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleToggleConfirmPassword}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  aria-pressed={showConfirmPassword}
                  className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-zinc-500 transition-colors hover:text-[#FF2D83] focus-visible:ring-2 focus-visible:ring-[#FF2D83]/60 focus-visible:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" aria-hidden />
                  ) : (
                    <Eye className="size-4" aria-hidden />
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-zinc-500">
              Select your account type. Admin access is assigned by an existing
              administrator.
            </p>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-3 text-sm text-red-300"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-shine mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#FF2D83] text-[15px] font-medium text-white shadow-lg shadow-[#FF2D83]/35 transition-all select-none hover:bg-[#ff4b97] hover:shadow-xl hover:shadow-[#FF2D83]/45 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[#FF2D83]/60 focus-visible:outline-none"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-500 transition-colors hover:text-[#ff4b97] hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[#FF2D83]/60 focus-visible:outline-none"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

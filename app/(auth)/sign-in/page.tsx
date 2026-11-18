"use client"

import Link from "next/link"
import { useState, type ChangeEvent, type FormEvent } from "react"
import {
  ArrowRight,
  BookOpen,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"

import { BrandMark, BrandWordmark } from "@/components/navbar"

interface SignInForm {
  email: string
  password: string
}

const INITIAL_FORM: SignInForm = {
  email: "",
  password: "",
}

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: "Verified tutors",
    description: "Learn with mentors we've carefully vetted.",
  },
  {
    icon: BookOpen,
    title: "Sessions that fit you",
    description: "Book one-on-one lessons on your own schedule.",
  },
  {
    icon: Users,
    title: "Mentorship batches",
    description: "Grow alongside students with the same goals.",
  },
]

export default function SignInPage() {
  const [form, setForm] = useState<SignInForm>(INITIAL_FORM)
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setSubmitted(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Demo only — the data is collected here until auth is integrated.
    console.log("Sign in form data:", form)
    setSubmitted(true)
  }

  return (
    <section className="flex min-h-[calc(100vh-16rem)] items-center justify-center px-3 py-8 sm:px-5 sm:py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-charcoal shadow-2xl shadow-black/30 lg:grid-cols-2">
        {/* Brand panel — decorative on larger screens */}
        <aside className="relative hidden overflow-hidden border-r border-white/10 bg-gradient-to-br from-brand-500/15 via-transparent to-ink-950/70 p-10 lg:flex lg:flex-col lg:justify-between">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-brand-500/20 blur-[100px]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute right-0 bottom-0 size-72 rounded-full bg-brand-500/10 blur-[90px]"
          />

          <div className="relative">
            <Link
              href="/"
              aria-label="MentorLagbe — home"
              className="inline-flex items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none"
            >
              <BrandMark className="size-10" />
              <BrandWordmark className="text-xl" />
            </Link>

            <span className="mt-12 inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-3.5 py-1.5 text-xs font-medium text-brand-300">
              <Sparkles className="size-3.5" aria-hidden />
              Your learning journey starts here
            </span>

            <h2 className="mt-5 text-3xl leading-tight font-bold tracking-tight text-white">
              Welcome back to your{" "}
              <span className="text-brand-400">next chapter.</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Pick up where you left off — your tutors, sessions and learning
              goals are waiting for you.
            </p>
          </div>

          <ul className="relative mt-10 space-y-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-brand-400">
                  <Icon className="size-4.5" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-medium text-white">
                    {title}
                  </span>
                  <span className="mt-0.5 block text-xs text-zinc-400">
                    {description}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Form panel */}
        <div className="px-6 py-10 sm:px-10 sm:py-12">
          <div className="lg:hidden">
            <Link
              href="/"
              aria-label="MentorLagbe — home"
              className="inline-flex items-center gap-2.5 rounded-xl focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none"
            >
              <BrandMark className="size-9" />
              <BrandWordmark className="text-lg" />
            </Link>
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-white sm:mt-0 sm:text-3xl lg:mt-0">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Enter your details below to continue learning.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-200"
              >
                Email address
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
                  className="h-12 w-full rounded-xl border border-white/10 bg-ink-950/60 pr-4 pl-11 text-sm text-white placeholder:text-zinc-600 transition-all duration-200 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/25 focus:outline-none"
                />
              </div>
            </div>

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
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-white/10 bg-ink-950/60 pr-12 pl-11 text-sm text-white placeholder:text-zinc-600 transition-all duration-200 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/25 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-zinc-500 transition-colors hover:text-brand-400 focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden />
                  ) : (
                    <Eye className="size-4" aria-hidden />
                  )}
                </button>
              </div>
            </div>

            {submitted && (
              <p
                role="status"
                className="flex items-center gap-2 rounded-xl border border-brand-500/30 bg-brand-500/10 px-3.5 py-3 text-sm text-brand-300"
              >
                <Check className="size-4 shrink-0" aria-hidden />
                Demo mode — your form data was collected.
              </p>
            )}

            <button
              type="submit"
              className="btn-shine group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-[15px] font-medium text-white shadow-lg shadow-brand-500/35 transition-all select-none hover:bg-brand-400 hover:shadow-xl hover:shadow-brand-500/45 active:translate-y-px focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none"
            >
              Sign In
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden
              />
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-zinc-400">
            New to MentorLagbe?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-brand-400 transition-colors hover:text-brand-300 hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

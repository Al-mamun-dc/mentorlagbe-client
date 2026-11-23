import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Search,
} from "lucide-react"

import { SectionHeading, SectionShell } from "@/components/sections/shared"

export const metadata = {
  title: "How It Works | MentorLagbe",
  description:
    "Learn how MentorLagbe connects students with trusted tutors through a simple four-step process.",
}

interface Step {
  number: string
  title: string
  description: string
  icon: LucideIcon
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "Find a Tuition",
    description:
      "Students browse approved and active tuition posts to find the right learning opportunity.",
    icon: Search,
  },
  {
    number: "02",
    title: "Apply for Tuition",
    description:
      "Students view details and submit an application for the tuition that matches their needs.",
    icon: BookOpen,
  },
  {
    number: "03",
    title: "Tutor Reviews Applications",
    description:
      "Tutors review applications and accept or reject them based on the student's requirements.",
    icon: ClipboardCheck,
  },
  {
    number: "04",
    title: "Start Learning",
    description:
      "Students and tutors connect to begin tuition and start a productive learning journey.",
    icon: GraduationCap,
  },
]

export default function HowItWorksPage() {
  return (
    <>
      <SectionShell>
        <div className="relative px-6 py-12 sm:px-10 sm:py-16">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/3 h-64 w-64 rounded-full bg-brand-500/10 blur-[100px]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute right-0 bottom-0 h-56 w-56 rounded-full bg-brand-500/5 blur-[90px]"
          />

          <div className="relative">
            <SectionHeading
              eyebrow="How It Works"
              title="A simple path from finding tuition to starting learning"
              description="MentorLagbe makes it easy for students and tutors to connect through a clear, trusted process."
            />

            <div className="relative mt-12">
              <span
                aria-hidden
                className="pointer-events-none absolute top-9 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent lg:block"
              />

              <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {STEPS.map(({ number, title, description, icon: Icon }) => (
                  <article
                    key={number}
                    className="group relative z-10 flex h-full flex-col rounded-2xl border border-white/10 bg-ink-900/80 p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-500/40 hover:bg-ink-900 hover:shadow-xl hover:shadow-brand-500/10"
                  >
                    <div className="flex items-center justify-between">
                      <span className="grid size-14 place-items-center rounded-2xl border border-brand-500/25 bg-brand-500/10 text-brand-400 transition-all duration-300 group-hover:scale-105 group-hover:bg-brand-500 group-hover:text-white">
                        <Icon className="size-6" aria-hidden />
                      </span>
                      <span className="text-3xl font-extrabold tracking-tight text-white/10 transition-colors group-hover:text-brand-500/30">
                        {number}
                      </span>
                    </div>

                    <h3 className="mt-6 text-base font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">{description}</p>

                    <div className="mt-5 flex items-center gap-2 text-xs font-medium text-brand-300/80">
                      <CheckCircle2 className="size-4 text-brand-500" aria-hidden />
                      Step {number.replace(/^0/, "")}
                    </div>

                    <span
                      aria-hidden
                      className="mt-4 h-px w-0 bg-brand-500 transition-all duration-300 group-hover:w-full"
                    />
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell className="pt-0 sm:pt-0">
        <div className="relative px-6 py-12 text-center sm:px-10 sm:py-16">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
          />
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">
            Ready to get started?
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Find the right tuition or join as a learner
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Browse approved tuition posts or create an account to apply and start learning with trusted tutors.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/tuitions"
              className="btn-shine inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 text-sm font-medium text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-400 active:translate-y-px focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none"
            >
              Browse Tuitions
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-medium text-zinc-100 transition-all hover:bg-white/10 hover:text-white active:translate-y-px focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none"
            >
              Create Account
            </Link>
          </div>
        </div>
      </SectionShell>
    </>
  )
}

import type { LucideIcon } from "lucide-react"
import { ClipboardList, Handshake, Rocket, UserPlus } from "lucide-react"

import { SectionHeading, SectionShell } from "./shared"

interface Step {
  number: string
  title: string
  description: string
  icon: LucideIcon
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "Create Account",
    description:
      "Sign up as a student or tutor in seconds and set up your profile.",
    icon: UserPlus,
  },
  {
    number: "02",
    title: "Explore or Post Tuition",
    description:
      "Browse listings that match your goals, or post a tuition as a tutor.",
    icon: ClipboardList,
  },
  {
    number: "03",
    title: "Connect and Apply",
    description:
      "Compare profiles, send applications, and chat to find the right fit.",
    icon: Handshake,
  },
  {
    number: "04",
    title: "Start Learning",
    description:
      "Book your sessions and begin learning with a mentor you trust.",
    icon: Rocket,
  },
]

export function HowItWorks() {
  return (
    <SectionShell>
      <div className="relative px-6 py-12 sm:px-10 sm:py-16">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/3 h-64 w-64 rounded-full bg-brand-500/10 blur-[100px]"
        />

        <div className="relative">
          <SectionHeading
            eyebrow="How It Works"
            title="From sign-up to your first lesson in four steps"
            description="A simple, guided flow designed to get students and tutors connected without the hassle."
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

                  <h3 className="mt-6 text-base font-semibold text-white">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {description}
                  </p>

                  <span
                    aria-hidden
                    className="mt-5 h-px w-0 bg-brand-500 transition-all duration-300 group-hover:w-full"
                  />
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}

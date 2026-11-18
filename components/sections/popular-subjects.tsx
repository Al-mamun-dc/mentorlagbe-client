import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowUpRight, Atom, Calculator, CodeXml, Languages } from "lucide-react"

import { SectionHeading, SectionShell } from "./shared"

interface Subject {
  name: string
  description: string
  tuitionCount: string
  icon: LucideIcon
}

const SUBJECTS: Subject[] = [
  {
    name: "Mathematics",
    description: "From school exams to advanced problem solving.",
    tuitionCount: "120+ tuitions",
    icon: Calculator,
  },
  {
    name: "Physics",
    description: "Build strong concepts with practical examples.",
    tuitionCount: "85+ tuitions",
    icon: Atom,
  },
  {
    name: "Programming",
    description: "Code, web, Python and career-ready skills.",
    tuitionCount: "64+ tuitions",
    icon: CodeXml,
  },
  {
    name: "IELTS",
    description: "Band-focused coaching for academic and general.",
    tuitionCount: "48+ tuitions",
    icon: Languages,
  },
]

export function PopularSubjects() {
  return (
    <SectionShell>
      <div className="relative px-6 py-12 sm:px-10 sm:py-16">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-brand-500/10 blur-[100px]"
        />

        <div className="relative">
          <SectionHeading
            eyebrow="Popular Subjects"
            title="Explore what students are learning most"
            description="Find experienced mentors across the subjects learners search for every day."
            action={{ label: "Browse All Subjects", href: "/tuitions" }}
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SUBJECTS.map(({ name, description, tuitionCount, icon: Icon }) => (
              <Link
                key={name}
                href="/tuitions"
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900/70 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-500/40 hover:bg-ink-900 hover:shadow-xl hover:shadow-brand-500/10 focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-16 -right-16 size-36 rounded-full bg-brand-500/0 blur-2xl transition-all duration-500 group-hover:bg-brand-500/20"
                />

                <span className="relative grid size-12 place-items-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-400 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white">
                  <Icon className="size-6" aria-hidden />
                </span>

                <h3 className="relative mt-5 text-lg font-semibold text-white">
                  {name}
                </h3>
                <p className="relative mt-2 flex-1 text-sm leading-relaxed text-zinc-400">
                  {description}
                </p>

                <div className="relative mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-xs font-medium text-brand-300">
                    {tuitionCount}
                  </span>
                  <ArrowUpRight
                    className="size-4 text-zinc-500 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-400"
                    aria-hidden
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  )
}

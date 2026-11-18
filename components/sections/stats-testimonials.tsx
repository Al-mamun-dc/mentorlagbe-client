import type { LucideIcon } from "lucide-react"
import { BookOpen, GraduationCap, Quote, Star, Users } from "lucide-react"

import { SectionHeading, SectionShell } from "./shared"

interface Stat {
  value: string
  label: string
  icon: LucideIcon
}

interface Testimonial {
  quote: string
  name: string
  role: string
  rating: number
  initials: string
}

const STATS: Stat[] = [
  { value: "500+", label: "Students", icon: Users },
  { value: "120+", label: "Tutors", icon: GraduationCap },
  { value: "300+", label: "Tuitions", icon: BookOpen },
]

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I found a mathematics tutor within a day. The sessions are focused, and my exam results improved faster than I expected.",
    name: "Aisha Karim",
    role: "Student, Class 12",
    rating: 5,
    initials: "AK",
  },
  {
    quote:
      "Posting my IELTS tuition here brought in serious learners. The whole process from application to booking feels effortless.",
    name: "Mehedi Hasan",
    role: "IELTS Tutor",
    rating: 5,
    initials: "MH",
  },
  {
    quote:
      "The mentorship batch gave me structure and accountability. Learning programming with peers kept me motivated every week.",
    name: "Sadia Rahman",
    role: "Programming Student",
    rating: 4,
    initials: "SR",
  },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`size-4 ${index < rating ? "fill-brand-500 text-brand-500" : "text-zinc-600"}`}
          aria-hidden
        />
      ))}
    </div>
  )
}

export function StatsTestimonials() {
  return (
    <SectionShell>
      <div className="relative px-6 py-12 sm:px-10 sm:py-16">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-brand-500/10 blur-[110px]"
        />

        <div className="relative">
          <SectionHeading
            eyebrow="Our Impact"
            title="Trusted by learners and mentors"
            description="Real people, real progress — here is what the MentorLagbe community looks like."
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div
                key={label}
                className="group rounded-2xl border border-white/10 bg-ink-900/70 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:bg-ink-900 hover:shadow-lg hover:shadow-brand-500/10"
              >
                <span className="mx-auto grid size-11 place-items-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-400 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="mt-4 text-3xl font-extrabold tracking-tight text-white">
                  {value}
                </p>
                <p className="mt-1 text-sm text-zinc-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <figure
                key={item.name}
                className="group flex h-full flex-col rounded-2xl border border-white/10 bg-ink-900/70 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-500/40 hover:bg-ink-900 hover:shadow-xl hover:shadow-brand-500/10"
              >
                <Quote
                  className="size-7 text-brand-500/40 transition-colors group-hover:text-brand-500/80"
                  aria-hidden
                />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-zinc-300">
                  “{item.quote}”
                </blockquote>
                <Stars rating={item.rating} />
                <figcaption className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5">
                  <span
                    aria-hidden
                    className="grid size-10 shrink-0 place-items-center rounded-full border border-brand-500/30 bg-brand-500/10 text-xs font-semibold text-brand-300"
                  >
                    {item.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">
                      {item.name}
                    </span>
                    <span className="block text-xs text-zinc-500">
                      {item.role}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  )
}

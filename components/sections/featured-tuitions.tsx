"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  BookOpen,
  Globe,
  GraduationCap,
  MapPin,
  Users,
} from "lucide-react"

import { SectionHeading, SectionShell } from "./shared"

interface Tuition {
  _id: string
  title: string
  subject: string
  classLevel: string
  mode: "Online" | "Offline"
  monthlyFee: number
  tutorName: string
}

export function FeaturedTuitions() {
  const [tuitions, setTuitions] = useState<Tuition[]>([])

  useEffect(() => {
    fetch("http://localhost:4000/tution-post")
      .then(res => res.json())
      .then(data => setTuitions(data.slice(0, 6)))
      .catch(console.error)
  }, [])

  return (
    <SectionShell>
      <div className="relative px-6 py-12 sm:px-10 sm:py-16">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-brand-500/10 blur-[100px]"
        />

        <div className="relative">
          <SectionHeading
            eyebrow="Featured Tuitions"
            title="Find a class that fits your goals"
            description="Handpicked tuitions from trusted mentors — compare subjects, schedules and monthly fees before you choose."
            action={{ label: "View All Tuitions", href: "/tuitions" }}
          />

          <div className="mt-10 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tuitions.map(tuition => (
              <article
                key={tuition._id}
                className="group flex h-full flex-col rounded-2xl border border-white/10 bg-ink-900/70 p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-500/40 hover:bg-ink-900 hover:shadow-xl hover:shadow-brand-500/10"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-[11px] font-medium text-brand-300">
                    <BookOpen className="size-3.5" />
                    {tuition.subject}
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
                    {tuition.mode === "Online" ? (
                      <Globe className="size-3.5 text-brand-400" />
                    ) : (
                      <MapPin className="size-3.5 text-brand-400" />
                    )}
                    {tuition.mode}
                  </span>
                </div>

                <h3 className="mt-4 line-clamp-2 min-h-12 text-base leading-snug font-semibold text-white group-hover:text-brand-200">
                  {tuition.title}
                </h3>

                <div className="mt-4 space-y-2 text-xs text-zinc-400">
                  <p className="flex items-center gap-2">
                    <GraduationCap className="size-4 shrink-0" />
                    {tuition.classLevel}
                  </p>

                  <p className="flex items-center gap-2">
                    <Users className="size-4 shrink-0" />
                    <span className="grid size-5 place-items-center rounded-full bg-brand-500/15 text-[9px] font-semibold text-brand-300">
                      {tuition.tutorName?.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="font-medium text-zinc-300">
                      {tuition.tutorName}
                    </span>
                  </p>
                </div>

                <div className="mt-auto pt-5">
                  <div className="mb-4 flex items-end justify-between border-t border-white/10 pt-4">
                    <div>
                      <p className="text-[11px] text-zinc-500">
                        Monthly fee
                      </p>
                      <p className="mt-0.5 text-xl font-bold text-white">
                        ৳{tuition.monthlyFee}
                        <span className="ml-1 text-xs font-normal text-zinc-500">
                          /mo
                        </span>
                      </p>
                    </div>

                    <span className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/5 text-zinc-500 group-hover:bg-brand-500 group-hover:text-white">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>

                  <Link
                    href={`/tuitions/${tuition._id}`}
                    className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-brand-500/40 bg-brand-500/10 text-sm font-medium text-brand-300 transition-all hover:bg-brand-500 hover:text-white"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
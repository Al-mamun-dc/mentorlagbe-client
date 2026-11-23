import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Clock,
  Globe,
  GraduationCap,
  MapPin,
  RefreshCw,
  Wallet,
} from "lucide-react"

import { getTuitionById, type TuitionDetails } from "@/lib/api/tution"
import { SectionHeading, SectionShell } from "@/components/sections/shared"
import { ApplyTuitionCard } from "./apply-tuition"
import { BookmarkButton } from "@/components/bookmark-button"

export const metadata = {
  title: "Tuition Details | MentorLagbe",
  description: "Complete details for an approved MentorLagbe tuition post.",
}

const feeFormatter = new Intl.NumberFormat("en-US")

function asText(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim() || fallback
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return fallback
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "T"
}

function normalizeDetails(raw: TuitionDetails): TuitionDetails {
  const mode = asText(raw.mode).toLowerCase() === "offline" ? "offline" : "online"
  const monthlyFee = Number(raw.monthlyFee)
  const daysPerWeek = Number(raw.daysPerWeek)
  const safeDays =
    Number.isInteger(daysPerWeek) && daysPerWeek >= 1 && daysPerWeek <= 7 ? daysPerWeek : 1

  return {
    id: asText(raw.id),
    title: asText(raw.title, "Untitled tuition"),
    subject: asText(raw.subject, "Subject not specified"),
    classLevel: asText(raw.classLevel, "Class level not specified"),
    mode,
    location: mode === "online" ? "Online" : asText(raw.location, "Location not specified"),
    monthlyFee: Number.isFinite(monthlyFee) && monthlyFee > 0 ? monthlyFee : 0,
    daysPerWeek: safeDays,
    schedule: asText(raw.schedule, `${safeDays} ${safeDays === 1 ? "day" : "days"} per week`),
    description: asText(raw.description, "No description was provided for this tuition."),
    bannerImage: asText(raw.bannerImage),
    createdAt: raw.createdAt ?? null,
    tutor: {
      name: asText(raw.tutor?.name, "MentorLagbe Tutor"),
      image: asText(raw.tutor?.image),
      role: asText(raw.tutor?.role, "tutor"),
      joinedAt: raw.tutor?.joinedAt ?? null,
    },
  }
}

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-4">
      <dt className="flex items-center gap-1.5 text-[11px] text-zinc-500">
        <Icon className="size-3.5 shrink-0 text-brand-400" aria-hidden />
        {label}
      </dt>
      <dd className="mt-1.5 truncate text-sm font-medium text-zinc-100" title={value}>
        {value}
      </dd>
    </div>
  )
}

function ErrorState({ message, retryHref }: { message: string; retryHref: string }) {
  return (
    <SectionShell>
      <div className="flex flex-col items-center px-6 py-20 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-rose-500/10 text-rose-300">
          <RefreshCw className="size-7" aria-hidden />
        </span>
        <h1 className="mt-5 text-xl font-semibold text-white">Could not load tuition details</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">{message}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={retryHref}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-400 focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none"
          >
            Try again
          </Link>
          <Link
            href="/tuitions"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 px-5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none"
          >
            Back to tuitions
          </Link>
        </div>
      </div>
    </SectionShell>
  )
}

export default async function TuitionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const retryHref = `/tuitions/${encodeURIComponent(id)}`

  let tuition: TuitionDetails | null = null
  let loadError = ""

  try {
    tuition = await getTuitionById(id)
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Please try again in a moment."
  }

  if (!loadError && !tuition) notFound()
  if (loadError) return <ErrorState message={loadError} retryHref={retryHref} />

  const details = normalizeDetails(tuition as TuitionDetails)
  const modeLabel = details.mode === "online" ? "Online" : "Offline"
  const daysLabel = `${details.daysPerWeek} ${details.daysPerWeek === 1 ? "day" : "days"}`
  const tutorName = details.tutor.name
  const joinedYear = details.tutor.joinedAt
    ? new Date(details.tutor.joinedAt).getFullYear()
    : null

  return (
    <SectionShell>
      <div className="relative px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-brand-500/10 blur-[100px]"
        />

        <div className="relative">
          <Link
            href="/tuitions"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-400 transition-colors hover:text-brand-300 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to tuitions
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0">
              <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-ink-800 via-ink-900 to-brand-950">
                {details.bannerImage ? (
                  // Remote ImgBB URLs are used directly; no local image loader is involved.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={details.bannerImage}
                    alt={`Banner for ${details.title}`}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="grid size-full place-items-center text-zinc-600">
                    <BookOpen className="size-16" aria-hidden />
                  </div>
                )}

                <div className="absolute inset-x-4 top-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-ink-950/80 px-3 py-1.5 text-xs font-medium text-brand-300 backdrop-blur">
                    <BookOpen className="size-3.5" aria-hidden />
                    {details.subject}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-ink-950/80 px-3 py-1.5 text-xs font-medium text-zinc-100 backdrop-blur">
                    {details.mode === "online" ? (
                      <Globe className="size-3.5 text-brand-400" aria-hidden />
                    ) : (
                      <MapPin className="size-3.5 text-brand-400" aria-hidden />
                    )}
                    {modeLabel}
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <SectionHeading
                  eyebrow="Tuition details"
                  title={details.title}
                  description={`${details.subject} • ${details.classLevel} • ${modeLabel}`}
                />
              </div>

              <section className="mt-8 rounded-2xl border border-white/10 bg-ink-900/70 p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-white">About this tuition</h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-zinc-400 sm:text-base">
                  {details.description}
                </p>
              </section>

              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                <MetaItem icon={GraduationCap} label="Class level" value={details.classLevel} />
                <MetaItem icon={Clock} label="Schedule" value={details.schedule} />
                <MetaItem icon={CalendarDays} label="Days per week" value={daysLabel} />
                <MetaItem icon={MapPin} label="Location" value={details.location} />
              </dl>
            </div>

            <aside className="h-fit rounded-2xl border border-white/10 bg-ink-900/70 p-6 lg:sticky lg:top-28">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">
                  Tuition summary
                </h2>
                <BookmarkButton tuitionId={details.id} iconOnly onDark />
              </div>

              <div className="mt-5 rounded-xl border border-brand-500/25 bg-brand-500/10 p-5">
                <p className="flex items-center gap-1.5 text-xs text-brand-300">
                  <Wallet className="size-3.5" aria-hidden />
                  Monthly fee
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  ৳{feeFormatter.format(details.monthlyFee)}
                  <span className="ml-1 text-sm font-normal text-zinc-400">/mo</span>
                </p>
              </div>

              <dl className="mt-5 space-y-4">
                <div>
                  <dt className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                    <BookOpen className="size-3.5 text-brand-400" aria-hidden />
                    Subject
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-zinc-100">{details.subject}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                    <GraduationCap className="size-3.5 text-brand-400" aria-hidden />
                    Class level
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-zinc-100">{details.classLevel}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                    <Clock className="size-3.5 text-brand-400" aria-hidden />
                    Schedule
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-zinc-100">{details.schedule}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                    {details.mode === "online" ? (
                      <Globe className="size-3.5 text-brand-400" aria-hidden />
                    ) : (
                      <MapPin className="size-3.5 text-brand-400" aria-hidden />
                    )}
                    Location / Mode
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-zinc-100">
                    {details.location} ({modeLabel})
                  </dd>
                </div>
              </dl>

              <div className="mt-6 border-t border-white/10 pt-6">
                <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                  Your tutor
                </h3>
                <div className="mt-4 flex items-center gap-3">
                  {details.tutor.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={details.tutor.image}
                      alt={tutorName}
                      className="size-12 rounded-full border border-white/10 object-cover"
                    />
                  ) : (
                    <span className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
                      {getInitials(tutorName)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{tutorName}</p>
                    <p className="text-xs text-zinc-500">MentorLagbe tutor</p>
                  </div>
                </div>
                {joinedYear && Number.isFinite(joinedYear) && (
                  <p className="mt-3 text-xs text-zinc-500">
                    Teaching with MentorLagbe since {joinedYear}
                  </p>
                )}
              </div>

              <ApplyTuitionCard tuitionId={details.id} tuitionTitle={details.title} />
            </aside>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}

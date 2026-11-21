import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import {
  BookOpen,
  CalendarDays,
  Globe,
  GraduationCap,
  MapPin,
  RefreshCw,
  SearchX,
  Wallet,
} from "lucide-react"

import { getAllTuitions } from "@/lib/api/tution"
import { SectionHeading, SectionShell } from "@/components/sections/shared"
import { TuitionFilters, type TuitionFiltersValue } from "./tuition-filters"

export const metadata = {
  title: "Browse Tuitions | MentorLagbe",
  description: "Find approved, active tuition posts by subject, class and mode.",
}

type RawSearchParams = Record<string, string | string[] | undefined>

type Mode = "online" | "offline"

interface Tuition {
  id: string
  bannerImage: string
  title: string
  subject: string
  classLevel: string
  mode: Mode
  location: string
  monthlyFee: number
  daysPerWeek: number
  description: string
}

function readParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return typeof value[0] === "string" ? value[0] : ""
  return typeof value === "string" ? value : ""
}

function readFilters(params: RawSearchParams): TuitionFiltersValue {
  const mode = readParam(params.mode).toLowerCase()

  return {
    search: readParam(params.search).trim().slice(0, 120),
    subject: readParam(params.subject).trim(),
    classLevel: readParam(params.classLevel).trim(),
    mode: mode === "online" || mode === "offline" ? mode : "",
  }
}

function buildApiQuery(filters: TuitionFiltersValue): string {
  const params = new URLSearchParams()

  if (filters.search) params.set("search", filters.search)
  if (filters.subject) params.set("subject", filters.subject)
  if (filters.classLevel) params.set("classLevel", filters.classLevel)
  if (filters.mode) params.set("mode", filters.mode)

  return params.toString()
}

function asText(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim() || fallback
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return fallback
}

function normalizeTuition(raw: unknown, index: number): Tuition {
  const record: Record<string, unknown> =
    raw !== null && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {}

  const mode: Mode = asText(record.mode).toLowerCase() === "offline" ? "offline" : "online"
  const monthlyFee = Number(record.monthlyFee)
  const daysPerWeek = Number(record.daysPerWeek)

  return {
    id: asText(record._id ?? record.id, `tuition-${index}`),
    bannerImage: asText(record.bannerImage),
    title: asText(record.title, "Untitled tuition"),
    subject: asText(record.subject, "Subject not specified"),
    classLevel: asText(record.classLevel, "Class level not specified"),
    mode,
    location: mode === "online" ? "Online" : asText(record.location, "Location not specified"),
    monthlyFee: Number.isFinite(monthlyFee) && monthlyFee > 0 ? monthlyFee : 0,
    daysPerWeek:
      Number.isInteger(daysPerWeek) && daysPerWeek >= 1 && daysPerWeek <= 7 ? daysPerWeek : 1,
    description: asText(record.description),
  }
}

const feeFormatter = new Intl.NumberFormat("en-US")

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
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-[11px] text-zinc-500">
        <Icon className="size-3.5 shrink-0" aria-hidden />
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium text-zinc-200" title={value}>
        {value}
      </dd>
    </div>
  )
}

function TuitionCard({ tuition }: { tuition: Tuition }) {
  const modeLabel = tuition.mode === "online" ? "Online" : "Offline"

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-white/10 bg-ink-900/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:bg-ink-900 hover:shadow-xl hover:shadow-brand-500/10">
      <div className="relative h-44 overflow-hidden rounded-xl bg-gradient-to-br from-ink-800 via-ink-900 to-brand-950">
        {tuition.bannerImage ? (
          // Remote ImgBB URLs are used directly; no local image loader is involved.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tuition.bannerImage}
            alt={`Banner for ${tuition.title}`}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-zinc-600">
            <BookOpen className="size-12" aria-hidden />
          </div>
        )}

        <div className="absolute inset-x-3 top-3 flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-ink-950/80 px-2.5 py-1 text-[11px] font-medium text-brand-300 backdrop-blur">
            <BookOpen className="size-3" aria-hidden />
            {tuition.subject}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-ink-950/80 px-2.5 py-1 text-[11px] font-medium text-zinc-200 backdrop-blur">
            {tuition.mode === "online" ? (
              <Globe className="size-3 text-brand-400" aria-hidden />
            ) : (
              <MapPin className="size-3 text-brand-400" aria-hidden />
            )}
            {modeLabel}
          </span>
        </div>
      </div>

      <h3 className="mt-4 line-clamp-2 min-h-12 text-base leading-snug font-semibold text-white transition-colors group-hover:text-brand-200">
        {tuition.title}
      </h3>

      <dl className="mt-4 grid grid-cols-2 gap-4">
        <MetaItem icon={GraduationCap} label="Class level" value={tuition.classLevel} />
        <MetaItem icon={MapPin} label="Location" value={tuition.location} />
        <MetaItem
          icon={Wallet}
          label="Monthly fee"
          value={`৳${feeFormatter.format(tuition.monthlyFee)} /mo`}
        />
        <MetaItem
          icon={CalendarDays}
          label="Days per week"
          value={`${tuition.daysPerWeek} ${tuition.daysPerWeek === 1 ? "day" : "days"}`}
        />
      </dl>

      <p className="mt-auto line-clamp-2 pt-5 text-sm leading-relaxed text-zinc-400">
        {tuition.description || "No description was provided for this tuition."}
      </p>
      <Link
        href={`/tuitions/${tuition.id}`}
        className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl border border-brand-500/40 bg-brand-500/10 text-sm font-medium text-brand-300 transition-all duration-300 hover:bg-brand-500 hover:text-white focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none"
      >
        View Details
      </Link>
    </article>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/15 bg-ink-900/50 px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-300">
        <SearchX className="size-7" aria-hidden />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-white">No tuition posts found</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
        Try a different title or subject, or clear the filters to see all approved and active
        tuitions.
      </p>
    </div>
  )
}

function ErrorState({ message, retryHref }: { message: string; retryHref: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-rose-500/25 bg-rose-500/5 px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-rose-500/10 text-rose-300">
        <RefreshCw className="size-7" aria-hidden />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-white">Could not load tuitions</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">{message}</p>
      <Link
        href={retryHref}
        className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-400 focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none"
      >
        Try again
      </Link>
    </div>
  )
}

export default async function BrowseTuitionsPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const filters = readFilters(await searchParams)
  const query = buildApiQuery(filters)
  const retryHref = query ? `/tuitions?${query}` : "/tuitions"

  let tuitions: Tuition[] = []
  let loadError = ""

  try {
    const result = await getAllTuitions(query)
    tuitions = Array.isArray(result)
      ? result.map((item, index) => normalizeTuition(item, index))
      : []
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Please try again in a moment."
  }

  return (
    <SectionShell>
      <div className="relative px-4 py-10 sm:px-8 sm:py-14 lg:px-12">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-brand-500/10 blur-[100px]"
        />

        <div className="relative">
          <SectionHeading
            eyebrow="Browse Tuitions"
            title="Find the right tuition for you"
            description="Explore approved, active tuition posts from MentorLagbe tutors. Search by title or subject, then narrow the results by class level and mode."
          />

          <div className="mt-8">
            <TuitionFilters key={query} initial={filters} />
          </div>

          <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold text-white">Available tuitions</h3>
            {!loadError && (
              <p aria-live="polite" className="text-sm text-zinc-400">
                {tuitions.length} {tuitions.length === 1 ? "tuition" : "tuitions"} found
              </p>
            )}
          </div>

          <div className="mt-5">
            {loadError ? (
              <ErrorState message={loadError} retryHref={retryHref} />
            ) : tuitions.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {tuitions.map((tuition) => (
                  <TuitionCard key={tuition.id} tuition={tuition} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SectionShell>
  )
}

"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircle, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface TuitionFiltersValue {
  search: string
  subject: string
  classLevel: string
  mode: string
}

interface TuitionFiltersProps {
  initial: TuitionFiltersValue
}

const SUBJECTS = [
  "All Subjects",
  "Biology",
  "Chemistry",
  "English",
  "Higher Mathematics",
  "ICT",
  "IELTS",
  "Mathematics",
  "Physics",
  "Programming",
  "Science",
]

const CLASS_LEVELS = [
  "Class 1–5",
  "Class 6–8",
  "Class 9–10",
  "Class 11–12",
  "Undergraduate",
  "Adults / Professional",
]

const SELECT_CLASS =
  "h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/25 disabled:opacity-60 [&>option]:bg-ink-900"

export function TuitionFilters({ initial }: TuitionFiltersProps) {
  const router = useRouter()
  const [filters, setFilters] = useState<TuitionFiltersValue>(initial)
  const [isPending, startTransition] = useTransition()

  function commit(next: TuitionFiltersValue) {
    const normalized: TuitionFiltersValue = {
      search: next.search.trim(),
      subject: next.subject.trim(),
      classLevel: next.classLevel.trim(),
      mode: next.mode.trim().toLowerCase(),
    }

    setFilters(next)

    const params = new URLSearchParams()
    if (normalized.search) params.set("search", normalized.search)
    if (normalized.subject) params.set("subject", normalized.subject)
    if (normalized.classLevel) params.set("classLevel", normalized.classLevel)
    if (normalized.mode === "online" || normalized.mode === "offline") {
      params.set("mode", normalized.mode)
    }

    const query = params.toString()
    startTransition(() => {
      router.push(query ? `/tuitions?${query}` : "/tuitions")
    })
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    commit(filters)
  }

  const hasFilters = Boolean(
    filters.search.trim() || filters.subject || filters.classLevel || filters.mode
  )

  return (
    <form
      onSubmit={handleSearch}
      aria-busy={isPending}
      className="rounded-2xl border border-white/10 bg-ink-900/70 p-4 sm:p-5"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="tuition-search" className="sr-only">
          Search by title or subject
        </label>
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500"
            aria-hidden
          />
          <Input
            id="tuition-search"
            type="search"
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({ ...current, search: event.target.value }))
            }
            placeholder="Search by title or subject..."
            disabled={isPending}
            className="h-11 border-white/10 bg-white/5 pl-9 text-white placeholder:text-zinc-600"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="h-11 bg-brand-500 px-5 text-white hover:bg-brand-400"
        >
          {isPending ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : (
            "Search"
          )}
        </Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label
            htmlFor="filter-subject"
            className="mb-1.5 block text-xs font-medium text-zinc-400"
          >
            Subject
          </label>
          <select
            id="filter-subject"
            value={filters.subject}
            disabled={isPending}
            onChange={(event) => commit({ ...filters, subject: event.target.value })}
            className={SELECT_CLASS}
          >
            <option value="">All subjects</option>
            {SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filter-classLevel"
            className="mb-1.5 block text-xs font-medium text-zinc-400"
          >
            Class Level
          </label>
          <select
            id="filter-classLevel"
            value={filters.classLevel}
            disabled={isPending}
            onChange={(event) => commit({ ...filters, classLevel: event.target.value })}
            className={SELECT_CLASS}
          >
            <option value="">All class levels</option>
            {CLASS_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filter-mode"
            className="mb-1.5 block text-xs font-medium text-zinc-400"
          >
            Mode
          </label>
          <select
            id="filter-mode"
            value={filters.mode}
            disabled={isPending}
            onChange={(event) => commit({ ...filters, mode: event.target.value })}
            className={SELECT_CLASS}
          >
            <option value="">All modes</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            disabled={isPending || !hasFilters}
            onClick={() => {
              const cleared = { search: "", subject: "", classLevel: "", mode: "" }
              setFilters(cleared)
              commit(cleared)
            }}
            className="h-11 w-full border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 hover:text-white"
          >
            <X className="size-4" aria-hidden />
            Clear filters
          </Button>
        </div>
      </div>
    </form>
  )
}

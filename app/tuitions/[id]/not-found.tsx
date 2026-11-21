import Link from "next/link"
import { SearchX } from "lucide-react"

import { SectionShell } from "@/components/sections/shared"

export default function TuitionNotFound() {
  return (
    <SectionShell>
      <div className="flex flex-col items-center px-6 py-20 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-300">
          <SearchX className="size-7" aria-hidden />
        </span>
        <h1 className="mt-5 text-xl font-semibold text-white">Tuition not found</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
          This tuition may no longer be available, or it has not been approved yet. Browse the
          latest approved and active tuitions instead.
        </p>
        <Link
          href="/tuitions"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-400 focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none"
        >
          Browse tuitions
        </Link>
      </div>
    </SectionShell>
  )
}

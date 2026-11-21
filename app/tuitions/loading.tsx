import { Skeleton } from "@/components/ui/skeleton"

export default function BrowseTuitionsLoading() {
  return (
    <section className="px-3 py-12 sm:px-5 sm:py-16">
      <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-charcoal p-6 shadow-2xl shadow-black/30 sm:p-10">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-32 rounded-full bg-white/10" />
          <Skeleton className="h-3 w-24 bg-white/5" />
        </div>
        <Skeleton className="mt-5 h-10 w-full max-w-md bg-white/10" />
        <Skeleton className="mt-3 h-4 w-full max-w-2xl bg-white/5" />

        <div className="mt-8 rounded-2xl border border-white/10 bg-ink-900/70 p-5">
          <Skeleton className="h-11 w-full bg-white/5" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-11 bg-white/5" />
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-white/10 bg-ink-900/70 p-4">
              <Skeleton className="h-44 w-full bg-white/5" />
              <Skeleton className="mt-4 h-5 w-4/5 bg-white/10" />
              <Skeleton className="mt-2 h-5 w-2/3 bg-white/10" />
              <div className="mt-4 grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((__, itemIndex) => (
                  <Skeleton key={itemIndex} className="h-8 bg-white/5" />
                ))}
              </div>
              <Skeleton className="mt-5 h-10 w-full bg-brand-500/10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import { Skeleton } from "@/components/ui/skeleton"

export default function TuitionDetailsLoading() {
  return (
    <section className="px-3 py-12 sm:px-5 sm:py-16">
      <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-charcoal p-6 shadow-2xl shadow-black/30 sm:p-10">
        <Skeleton className="h-4 w-32 bg-white/5" />

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <Skeleton className="aspect-[16/9] w-full rounded-3xl bg-white/5" />

            <div className="mt-8">
              <Skeleton className="h-6 w-32 rounded-full bg-white/10" />
              <Skeleton className="mt-4 h-9 w-full max-w-xl bg-white/10" />
              <Skeleton className="mt-3 h-4 w-full max-w-lg bg-white/5" />
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-ink-900/70 p-6 sm:p-8">
              <Skeleton className="h-5 w-40 bg-white/10" />
              <Skeleton className="mt-5 h-4 w-full bg-white/5" />
              <Skeleton className="mt-3 h-4 w-full bg-white/5" />
              <Skeleton className="mt-3 h-4 w-4/5 bg-white/5" />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <Skeleton className="h-3 w-24 bg-white/5" />
                  <Skeleton className="mt-3 h-4 w-3/4 bg-white/10" />
                </div>
              ))}
            </div>
          </div>

          <div className="h-fit rounded-2xl border border-white/10 bg-ink-900/70 p-6">
            <Skeleton className="h-4 w-36 bg-white/10" />
            <Skeleton className="mt-5 h-24 w-full rounded-xl bg-brand-500/10" />
            <div className="mt-5 space-y-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index}>
                  <Skeleton className="h-3 w-20 bg-white/5" />
                  <Skeleton className="mt-2 h-4 w-3/4 bg-white/10" />
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-white/10 pt-6">
              <Skeleton className="h-3 w-24 bg-white/5" />
              <div className="mt-4 flex items-center gap-3">
                <Skeleton className="size-12 rounded-full bg-white/10" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 bg-white/10" />
                  <Skeleton className="mt-2 h-3 w-24 bg-white/5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

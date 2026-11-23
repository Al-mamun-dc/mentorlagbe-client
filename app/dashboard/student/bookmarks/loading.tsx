export default function Loading() {
  return (
    <section className="mx-auto w-full max-w-6xl" aria-busy="true" aria-label="Loading bookmarks">
      <div className="mb-6 space-y-2">
        <div className="h-3 w-32 animate-pulse rounded bg-muted" />
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-5">
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((__, j) => (
                <div key={j}>
                  <div className="h-3 w-20 rounded bg-muted" />
                  <div className="mt-2 h-4 w-32 rounded bg-muted" />
                </div>
              ))}
            </div>
            <div className="mt-6 h-8 w-28 rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </section>
  )
}

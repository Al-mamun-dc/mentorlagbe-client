import { cn } from "cn"

import { Skeleton } from "@/components/ui/skeleton"

interface SkeletonBlockProps {
  className?: string
}

export function StatCardsSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-3 w-full max-w-[14rem]" />
            </div>
            <Skeleton className="size-11 shrink-0 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({
  rows = 5,
  columns = 6,
  className,
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-card shadow-sm", className)}>
      <div className="border-b border-border bg-muted/30 px-4 py-3">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-full max-w-20" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={row}
            className="grid gap-3 px-4 py-4"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((__, col) => (
              <Skeleton key={col} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardListSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-5 lg:grid-cols-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((__, j) => (
              <div key={j} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-5 h-9 w-28 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

export function PageHeaderSkeleton({ className, withAction = true }: { className?: string; withAction?: boolean }) {
  return (
    <div className={cn("mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      {withAction ? <Skeleton className="h-9 w-24 rounded-lg" /> : null}
    </div>
  )
}

export function DashboardPageSkeleton({
  stats = 4,
  rows = 5,
  columns = 6,
  className,
}: {
  stats?: number
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <section className={cn("mx-auto w-full max-w-7xl", className)}>
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={stats} className="mb-6" />
      <TableSkeleton rows={rows} columns={columns} />
    </section>
  )
}

export function ProfileSkeleton({ className }: SkeletonBlockProps) {
  return (
    <section className={cn("mx-auto w-full max-w-5xl", className)}>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="rounded-3xl border border-white/10 bg-charcoal p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Skeleton className="size-24 rounded-full bg-white/10" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-40 bg-white/10" />
            <Skeleton className="h-4 w-56 bg-white/5" />
            <Skeleton className="h-9 w-32 rounded-lg bg-white/10" />
          </div>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24 bg-white/10" />
              <Skeleton className="h-11 w-full rounded-xl bg-white/5" />
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2">
          <Skeleton className="h-4 w-16 bg-white/10" />
          <Skeleton className="h-28 w-full rounded-xl bg-white/5" />
        </div>
      </div>
    </section>
  )
}

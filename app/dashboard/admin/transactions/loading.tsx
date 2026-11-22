import { PageHeaderSkeleton, StatCardsSkeleton, TableSkeleton } from "@/components/ui/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminTransactionsLoading() {
  return (
    <section className="mx-auto w-full max-w-7xl">
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={4} className="mb-6" />
      <div className="mb-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <TableSkeleton rows={6} columns={8} />
    </section>
  )
}

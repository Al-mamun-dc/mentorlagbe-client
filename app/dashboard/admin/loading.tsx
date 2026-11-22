import { PageHeaderSkeleton, StatCardsSkeleton } from "@/components/ui/skeletons"

export default function AdminOverviewLoading() {
  return (
    <section className="mx-auto w-full max-w-7xl">
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={5} className="xl:grid-cols-5" />
    </section>
  )
}

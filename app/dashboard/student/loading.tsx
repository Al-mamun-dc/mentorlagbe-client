import { PageHeaderSkeleton, StatCardsSkeleton } from "@/components/ui/skeletons"

export default function StudentDashboardLoading() {
  return (
    <section className="mx-auto w-full max-w-7xl">
      <PageHeaderSkeleton withAction={false} />
      <StatCardsSkeleton count={4} />
    </section>
  )
}

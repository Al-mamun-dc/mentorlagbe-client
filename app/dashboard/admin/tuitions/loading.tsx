import { PageHeaderSkeleton, StatCardsSkeleton, CardListSkeleton } from "@/components/ui/skeletons"

export default function AdminTuitionsLoading() {
  return (
    <section className="mx-auto w-full max-w-7xl">
      <PageHeaderSkeleton withAction={false} />
      <StatCardsSkeleton count={4} className="mb-6" />
      <CardListSkeleton count={4} className="lg:grid-cols-2" />
    </section>
  )
}

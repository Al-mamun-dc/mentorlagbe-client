import { CardListSkeleton, PageHeaderSkeleton, StatCardsSkeleton } from "@/components/ui/skeletons"

export default function MyTuitionsLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl">
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={4} className="mb-6" />
      <CardListSkeleton count={4} className="md:grid-cols-2 xl:grid-cols-3" />
    </section>
  )
}

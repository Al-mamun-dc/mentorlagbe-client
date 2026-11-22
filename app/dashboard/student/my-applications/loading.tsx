import { CardListSkeleton, PageHeaderSkeleton } from "@/components/ui/skeletons"

export default function MyApplicationsLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl">
      <PageHeaderSkeleton />
      <CardListSkeleton count={4} />
    </section>
  )
}

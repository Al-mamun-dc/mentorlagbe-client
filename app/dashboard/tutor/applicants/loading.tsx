import { PageHeaderSkeleton, StatCardsSkeleton, TableSkeleton } from "@/components/ui/skeletons"

export default function TutorApplicantsLoading() {
  return (
    <section className="mx-auto w-full max-w-7xl">
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={4} className="mb-6" />
      <TableSkeleton rows={5} columns={8} />
    </section>
  )
}

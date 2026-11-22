import Link from "next/link"
import { XCircle } from "lucide-react"

export const metadata = {
  title: "Checkout Canceled | MentorLagbe",
  description: "Your Stripe checkout was canceled and your plan was not changed.",
}

export default function PaymentCancelPage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-6 py-16 sm:px-10">
      <div className="rounded-2xl border border-amber-500/25 bg-ink-900/70 p-8 text-center shadow-2xl shadow-amber-500/10 sm:p-12">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-amber-500/15 text-amber-400">
          <XCircle className="size-9" aria-hidden />
        </span>

        <h1 className="mt-6 text-2xl font-bold text-white sm:text-3xl">
          Checkout canceled
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          No payment was completed, and your existing plan remains unchanged. You can
          return to the pricing page whenever you are ready.
        </p>

        <Link
          href="/pricing"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-brand-500 px-5 font-medium text-white hover:bg-brand-400"
        >
          Back to pricing
        </Link>
      </div>
    </section>
  )
}

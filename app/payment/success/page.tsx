"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, LoaderCircle } from "lucide-react"

import { useSession } from "@/lib/auth-client"

type CurrentPlan = "free" | "pro"

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const { data: session, isPending } = useSession()
  const [plan, setPlan] = useState<CurrentPlan | null>(null)
  const [isLoadingPlan, setIsLoadingPlan] = useState(false)

  useEffect(() => {
    if (isPending || !session?.user) return

    const controller = new AbortController()

    async function loadPlan() {
      setIsLoadingPlan(true)
      try {
        const response = await fetch("/api/user/plan", {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        })
        if (!response.ok) return

        const data = (await response.json()) as { plan?: string }
        setPlan(data.plan === "pro" ? "pro" : "free")
      } catch {
        // The webhook remains the source of truth. The page never changes the plan.
      } finally {
        if (!controller.signal.aborted) setIsLoadingPlan(false)
      }
    }

    void loadPlan()

    return () => controller.abort()
  }, [isPending, session?.user])

  return (
    <section className="mx-auto w-full max-w-2xl px-6 py-16 sm:px-10">
      <div className="rounded-2xl border border-emerald-500/25 bg-ink-900/70 p-8 text-center shadow-2xl shadow-emerald-500/10 sm:p-12">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
          <CheckCircle2 className="size-9" aria-hidden />
        </span>

        <h1 className="mt-6 text-2xl font-bold text-white sm:text-3xl">
          Payment successful
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Your Pro subscription is being verified and activated by our secure Stripe
          webhook. This can take a few moments. You do not need to take any further
          action.
        </p>

        {sessionId ? (
          <p className="mt-5 truncate rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-500">
            Checkout session: <span className="text-zinc-400">{sessionId}</span>
          </p>
        ) : null}

        <div className="mt-6 min-h-6 text-sm" aria-live="polite">
          {isLoadingPlan || isPending ? (
            <span className="inline-flex items-center gap-2 text-zinc-400">
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
              Checking your current plan…
            </span>
          ) : plan === "pro" ? (
            <span className="font-medium text-emerald-400">Your Pro plan is active.</span>
          ) : plan === "free" ? (
            <span className="text-amber-300">
              Activation is still in progress. Your plan will update automatically once
              Stripe confirms the subscription.
            </span>
          ) : (
            <span className="text-zinc-500">
              Sign in to view your current plan.
            </span>
          )}
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/pricing"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-500 px-5 font-medium text-white hover:bg-brand-400"
          >
            Back to pricing
          </Link>
          <Link
            href={
              session?.user?.role === "admin"
                ? "/dashboard/admin"
                : session?.user?.role === "tutor"
                  ? "/dashboard/tutor"
                  : "/dashboard/student"
            }
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 font-medium text-zinc-100 hover:border-brand-500/40 hover:bg-brand-500/10 hover:text-white"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto w-full max-w-2xl px-6 py-16 text-center text-sm text-zinc-400 sm:px-10">
          Loading payment status…
        </section>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}

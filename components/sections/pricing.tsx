"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Check, CreditCard, LoaderCircle, Sparkles } from "lucide-react"

import { useSession } from "@/lib/auth-client"
import { SectionHeading, SectionShell } from "./shared"

type PricingRole = "student" | "tutor"
type CurrentPlan = "free" | "pro"

interface Plan {
  key: CurrentPlan
  name: string
  price: string
  period: string
  description: string
  features: string[]
  featured: boolean
  role: PricingRole
}

const PLAN_CONTENT: Record<
  PricingRole,
  { freeFeatures: string[]; proFeatures: string[]; proPrice: string }
> = {
  student: {
    proPrice: "$10",
    freeFeatures: [
      "Browse public tuition listings",
      "Save up to 5 tuitions",
      "Apply to approved tuitions",
      "Basic tutor profiles",
    ],
    proFeatures: [
      "Unlimited tuition bookmarks",
      "Priority application reviews",
      "Direct chat with tutors",
      "Progress tracking dashboard",
    ],
  },
  tutor: {
    proPrice: "$15",
    freeFeatures: [
      "Create a basic tutor profile",
      "Post up to 2 tuitions",
      "Community support",
    ],
    proFeatures: [
      "Unlimited tuition posts",
      "Featured tutor badge",
      "Advanced analytics",
      "Priority listing placement",
    ],
  },
}

function FeatureList({ items, title }: { items: string[]; title: string }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.15em] text-zinc-500 uppercase">
        {title}
      </p>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-300">
            <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-brand-500/15 text-brand-400">
              <Check className="size-3" strokeWidth={3} aria-hidden />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function buildPlans(role: PricingRole): Plan[] {
  const content = PLAN_CONTENT[role]
  const label = role === "student" ? "Student" : "Tutor"

  return [
    {
      key: "free",
      name: `${label} Free`,
      price: "$0",
      period: "forever",
      description: "Everything you need to explore and get started.",
      features: content.freeFeatures,
      featured: false,
      role,
    },
    {
      key: "pro",
      name: `${label} Pro`,
      price: content.proPrice,
      period: "per month",
      description: "More reach, more tools, and a faster path to your goal.",
      features: content.proFeatures,
      featured: true,
      role,
    },
  ]
}

export function Pricing() {
  const { data: session, isPending } = useSession()
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null)
  const [isLoadingPlan, setIsLoadingPlan] = useState(false)
  const [checkoutRole, setCheckoutRole] = useState<PricingRole | null>(null)
  const [checkoutError, setCheckoutError] = useState("")

  const role = session?.user?.role
  const pricingRole: PricingRole | null =
    role === "student" || role === "tutor" ? role : null

  const loadPlan = useCallback(async () => {
    if (!pricingRole) return

    setIsLoadingPlan(true)
    try {
      const response = await fetch("/api/user/plan", {
        credentials: "include",
        cache: "no-store",
      })
      if (!response.ok) throw new Error("Unable to load your current plan.")

      const data = (await response.json()) as { plan?: string }
      setCurrentPlan(data.plan === "pro" ? "pro" : "free")
    } catch {
      setCurrentPlan(null)
    } finally {
      setIsLoadingPlan(false)
    }
  }, [pricingRole])

  useEffect(() => {
    if (isPending || !pricingRole) return

    queueMicrotask(() => {
      void loadPlan()
    })
  }, [isPending, pricingRole, loadPlan])

  async function handleSubscribe(planRole: PricingRole) {
    if (pricingRole !== planRole) return

    setCheckoutError("")
    setCheckoutRole(planRole)

    try {
      const response = await fetch("/api/checkout_sessions", {
        method: "POST",
        credentials: "include",
      })
      const data = (await response.json().catch(() => ({}))) as {
        url?: string
        error?: string
      }

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to start checkout. Please try again.")
      }

      window.location.assign(data.url)
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : "Unable to start checkout."
      )
      setCheckoutRole(null)
    }
  }

  const isInitialLoading = isPending || (Boolean(pricingRole) && currentPlan === null && isLoadingPlan)

  return (
    <SectionShell>
      <div className="relative px-6 py-12 sm:px-10 sm:py-16">
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-brand-500/10 blur-[100px]"
        />

        <div className="relative">
          <SectionHeading
            eyebrow="Simple Pricing"
            title="Choose the plan that moves you forward"
            description="Start free, upgrade when you are ready. Plans are shown for your account role."
          />

          {checkoutError ? (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
            >
              {checkoutError}
            </p>
          ) : null}

          {isInitialLoading ? (
            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-zinc-400">
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
              Loading your plans…
            </div>
          ) : !session ? (
            <div className="mt-10 rounded-2xl border border-white/10 bg-ink-900/60 p-8 text-center">
              <h3 className="text-lg font-semibold text-white">Sign in to view plans</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Student and tutor plans are available after you sign in.
              </p>
              <Link
                href="/sign-in"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand-500 px-5 font-medium text-white hover:bg-brand-400"
              >
                Sign in
              </Link>
            </div>
          ) : !pricingRole ? (
            <div className="mt-10 rounded-2xl border border-white/10 bg-ink-900/60 p-8 text-center">
              <h3 className="text-lg font-semibold text-white">
                Plans are not available for this account
              </h3>
              <p className="mt-2 text-sm text-zinc-400">
                Pro subscriptions are available for student and tutor accounts only.
              </p>
            </div>
          ) : (
            <>
              <p className="mt-6 text-sm text-zinc-400">
                Current plan:{" "}
                <span className="font-medium text-white">
                  {currentPlan === "pro" ? "Pro" : "Free"}
                </span>
              </p>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {buildPlans(pricingRole).map((plan) => {
                  const isCurrentPlan = currentPlan === plan.key
                  const isPro = plan.key === "pro"
                  const isBusy = checkoutRole === plan.role

                  return (
                    <article
                      key={plan.name}
                      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 transition-all duration-300 sm:p-8 ${
                        plan.featured
                          ? "border-brand-500/50 bg-gradient-to-b from-brand-500/10 via-ink-900/80 to-ink-900 shadow-2xl shadow-brand-500/15"
                          : "border-white/10 bg-ink-900/60 hover:border-white/20"
                      }`}
                    >
                      {plan.featured && (
                        <>
                          <span
                            aria-hidden
                            className="pointer-events-none absolute -top-20 right-0 h-52 w-52 rounded-full bg-brand-500/20 blur-[80px]"
                          />
                          <span className="absolute top-0 right-0 inline-flex items-center gap-1.5 rounded-bl-xl bg-brand-500 px-4 py-1.5 text-[11px] font-semibold tracking-wide text-white uppercase">
                            <Sparkles className="size-3" aria-hidden />
                            Most Popular
                          </span>
                        </>
                      )}

                      <div className="relative">
                        <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                        <div className="mt-3 flex items-end gap-2">
                          <span className="text-4xl font-extrabold tracking-tight text-white">
                            {plan.price}
                          </span>
                          <span className="pb-1 text-sm text-zinc-400">{plan.period}</span>
                        </div>
                        <p className="mt-3 min-h-10 text-sm text-zinc-400">
                          {plan.description}
                        </p>
                      </div>

                      <div className="relative mt-6 border-t border-white/10 pt-6">
                        <FeatureList
                          title={`For ${pricingRole}s`}
                          items={plan.features}
                        />
                      </div>

                      <button
                        type="button"
                        disabled={isCurrentPlan || isBusy}
                        onClick={() => {
                          if (isPro) void handleSubscribe(plan.role)
                        }}
                        className={`btn-shine mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-medium transition-all select-none active:translate-y-px focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
                          plan.featured
                            ? "bg-brand-500 text-white shadow-lg shadow-brand-500/35 hover:bg-brand-400 hover:shadow-xl hover:shadow-brand-500/45"
                            : "border border-white/15 bg-white/5 text-zinc-100 hover:border-brand-500/40 hover:bg-brand-500/10 hover:text-white"
                        }`}
                      >
                        {isBusy ? (
                          <LoaderCircle className="size-4 animate-spin" aria-hidden />
                        ) : (
                          <CreditCard className="size-4" aria-hidden />
                        )}
                        {isBusy
                          ? "Opening Stripe…"
                          : isCurrentPlan
                            ? isPro
                              ? "Pro active"
                              : "Current plan"
                            : isPro
                              ? "Subscribe with Stripe"
                              : "Continue free"}
                      </button>
                      {isPro ? (
                        <p className="mt-3 text-center text-[11px] text-zinc-600">
                          Secure monthly subscription powered by Stripe.
                        </p>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </SectionShell>
  )
}

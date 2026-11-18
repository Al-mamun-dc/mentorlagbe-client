import { Check, CreditCard, Sparkles } from "lucide-react"

import { SectionHeading, SectionShell } from "./shared"

interface Plan {
  name: string
  price: string
  period: string
  description: string
  studentFeatures: string[]
  tutorFeatures: string[]
  featured: boolean
}

/* Static demo data — buttons are intentionally visual-only for now. */
const PLANS: Plan[] = [
  {
    name: "Free",
    price: "৳0",
    period: "forever",
    description: "Everything you need to explore and get started.",
    studentFeatures: [
      "Browse public tuition listings",
      "Save up to 3 tuitions",
      "Basic tutor profiles",
    ],
    tutorFeatures: [
      "Create a basic tutor profile",
      "Apply to 3 tuitions / month",
      "Community support",
    ],
    featured: false,
  },
  {
    name: "Pro",
    price: "৳499",
    period: "per month",
    description: "More reach, more tools, and a faster path to your goal.",
    studentFeatures: [
      "Unlimited tuition browsing",
      "Priority application reviews",
      "Direct chat with tutors",
      "Progress tracking dashboard",
    ],
    tutorFeatures: [
      "Featured tutor badge",
      "Unlimited tuition applications",
      "Advanced analytics",
      "Priority listing placement",
    ],
    featured: true,
  },
]

function FeatureList({ title, items }: { title: string; items: string[] }) {
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

export function Pricing() {
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
            description="Start free, upgrade when you are ready. Every plan includes separate benefits for students and tutors."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {PLANS.map((plan) => (
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
                  <h3 className="text-lg font-semibold text-white">
                    {plan.name}
                  </h3>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-4xl font-extrabold tracking-tight text-white">
                      {plan.price}
                    </span>
                    <span className="pb-1 text-sm text-zinc-400">
                      {plan.period}
                    </span>
                  </div>
                  <p className="mt-3 min-h-10 text-sm text-zinc-400">
                    {plan.description}
                  </p>
                </div>

                <div className="relative mt-6 grid gap-6 border-t border-white/10 pt-6 sm:grid-cols-2">
                  <FeatureList
                    title="For Students"
                    items={plan.studentFeatures}
                  />
                  <FeatureList title="For Tutors" items={plan.tutorFeatures} />
                </div>

                <button
                  type="button"
                  className={`btn-shine mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-medium transition-all select-none active:translate-y-px focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none ${
                    plan.featured
                      ? "bg-brand-500 text-white shadow-lg shadow-brand-500/35 hover:bg-brand-400 hover:shadow-xl hover:shadow-brand-500/45"
                      : "border border-white/15 bg-white/5 text-zinc-100 hover:border-brand-500/40 hover:bg-brand-500/10 hover:text-white"
                  }`}
                >
                  <CreditCard className="size-4" aria-hidden />
                  Subscribe with Stripe
                </button>
                <p className="mt-3 text-center text-[11px] text-zinc-600">
                  Demo button — no payment is processed yet.
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  )
}

import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

/** Shared floating-card shell so every homepage section matches the hero/footer. */
export function SectionShell({
  id,
  children,
  className = "",
}: {
  id?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`px-3 py-12 sm:px-5 sm:py-16 ${className}`}>
      <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-charcoal shadow-2xl shadow-black/30">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/70 to-transparent"
        />
        {children}
      </div>
    </section>
  )
}

export interface SectionAction {
  label: string
  href: string
}

/** Consistent eyebrow + heading + optional "view all" link. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description?: string
  action?: SectionAction
}) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <span className="inline-flex animate-hero-up items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1.5 text-xs font-medium text-brand-300">
          <span aria-hidden className="size-1.5 rounded-full bg-brand-500" />
          {eyebrow}
        </span>
        <h2 className="mt-4 animate-hero-up text-3xl leading-tight font-bold tracking-tight text-white text-balance sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 animate-hero-up text-sm leading-relaxed text-zinc-400 text-pretty sm:text-base">
            {description}
          </p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 animate-hero-up items-center gap-2 text-sm font-medium text-brand-400 transition-colors hover:text-brand-300 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none"
        >
          {action.label}
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      )}
    </div>
  )
}

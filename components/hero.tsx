import Link from "next/link"
import { ArrowRight, BadgeCheck, Clock, ShieldCheck, Sparkles } from "lucide-react"

/* ------------------------------ Illustration ------------------------------ */

/**
 * Flat vector scene of a tutor guiding a student at a desk, drawn to match
 * the MentorLagbe palette (charcoal + hot pink). Decorative, so aria-hidden.
 */
function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 520 440"
      fill="none"
      aria-hidden="true"
      className="relative h-auto w-full drop-shadow-2xl"
    >
      {/* Floor shadow */}
      <ellipse cx="260" cy="398" rx="200" ry="14" fill="#1b1e26" />

      {/* Tutor */}
      <path d="M98 300 v-58 a50 50 0 0 1 100 0 v58 Z" fill="#FF2D83" />
      <circle cx="148" cy="140" r="34" fill="#f2c9a4" />
      <path d="M114 140 a34 34 0 0 1 68 0 Z" fill="#23262f" />
      <circle cx="182" cy="120" r="12" fill="#23262f" />
      <circle cx="138" cy="150" r="3" fill="#23262f" />
      <circle cx="158" cy="150" r="3" fill="#23262f" />
      <path
        d="M140 160 q8 6 16 0"
        stroke="#23262f"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Student */}
      <path d="M356 300 v-52 a46 46 0 0 1 92 0 v52 Z" fill="#eef1f6" />
      <circle cx="402" cy="152" r="30" fill="#e0a97f" />
      <path d="M372 152 a30 30 0 0 1 60 0 Z" fill="#171a22" />
      <circle cx="394" cy="158" r="3" fill="#171a22" />
      <circle cx="412" cy="158" r="3" fill="#171a22" />
      <path
        d="M396 166 q7 5 14 0"
        stroke="#171a22"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Desk */}
      <rect x="66" y="286" width="388" height="16" rx="8" fill="#4a5060" />
      <rect x="96" y="302" width="14" height="92" rx="7" fill="#3a3f4d" />
      <rect x="410" y="302" width="14" height="92" rx="7" fill="#3a3f4d" />

      {/* Laptop */}
      <rect x="298" y="212" width="112" height="76" rx="10" fill="#2a2e3a" />
      <rect x="306" y="220" width="96" height="60" rx="6" fill="#171a22" />
      <rect x="314" y="230" width="44" height="6" rx="3" fill="#FF2D83" />
      <rect x="314" y="242" width="60" height="6" rx="3" fill="#59617a" />
      <rect x="314" y="254" width="36" height="6" rx="3" fill="#59617a" />
      <rect x="314" y="266" width="52" height="6" rx="3" fill="#FF2D83" opacity="0.6" />
      <rect x="286" y="288" width="134" height="10" rx="5" fill="#5b6273" />

      {/* Books */}
      <rect x="118" y="276" width="56" height="10" rx="3" fill="#FF2D83" />
      <rect x="122" y="264" width="48" height="10" rx="3" fill="#eceff5" />
      <rect x="126" y="252" width="42" height="10" rx="3" fill="#8b93a7" />

      {/* Mug */}
      <rect x="204" y="264" width="24" height="24" rx="5" fill="#FF2D83" />
      <path
        d="M228 272 h8 a6 6 0 0 1 0 12 h-8"
        stroke="#FF2D83"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Arms + hands */}
      <rect x="168" y="226" width="120" height="18" rx="9" fill="#e13e77" />
      <circle cx="288" cy="235" r="10" fill="#f2c9a4" />
      <rect x="312" y="270" width="60" height="16" rx="8" fill="#d7dce6" />
      <circle cx="374" cy="278" r="9" fill="#e0a97f" />

      {/* Decor */}
      <circle cx="70" cy="120" r="5" fill="#FF2D83" opacity="0.7" />
      <circle cx="470" cy="100" r="7" fill="#FF2D83" opacity="0.45" />
      <circle cx="252" cy="66" r="4" fill="#ffffff" opacity="0.35" />
      <circle cx="496" cy="220" r="4" fill="#ffffff" opacity="0.3" />
      <path
        d="M46 250 h16 M54 242 v16"
        stroke="#FF2D83"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M466 300 h14 M473 293 v14"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.3"
      />

      {/* Floating graduation cap */}
      <g transform="translate(96 84) rotate(-8)">
        <path d="M20 0 L40 8 20 16 0 8 Z" fill="#FF2D83" />
        <path d="M12 12 v8 a8 5 0 0 0 16 0 v-8" fill="#e13e77" />
        <path
          d="M40 8 v10"
          stroke="#FF2D83"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="40" cy="20" r="3" fill="#FF2D83" />
      </g>

      {/* Check badge */}
      <g transform="translate(468 52)">
        <circle r="16" fill="#FF2D83" />
        <path
          d="M-6 0 l4 5 8 -9"
          stroke="#ffffff"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

/* ------------------------------- Floating cards ---------------------------- */

const FLOATING_CARDS = [
  {
    icon: BadgeCheck,
    title: "Expert Tutors",
    subtitle: "850+ verified mentors",
    position: "top-4 -left-1 sm:top-8 sm:-left-5",
    animation: "animate-float",
  },
  {
    icon: Clock,
    title: "Flexible Learning",
    subtitle: "Book sessions that fit you",
    position: "top-2 -right-1 sm:top-5 sm:-right-5",
    animation: "animate-float-slow",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Mentors",
    subtitle: "Background-checked & rated",
    position: "bottom-5 left-1 sm:left-4",
    animation: "animate-float",
  },
]

/* ---------------------------------- Hero ---------------------------------- */

export function Hero() {
  return (
    <section className="px-3 pt-4 sm:px-5 sm:pt-6">
      <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-charcoal shadow-2xl shadow-black/30">
        {/* Hairline glow + ambient wash — echoes the navbar and footer */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/70 to-transparent"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/4 -right-24 h-96 w-96 rounded-full bg-brand-500/15 blur-[110px]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-brand-500/10 blur-[100px]"
        />

        <div className="relative grid items-center gap-12 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:py-20">
          {/* Left content */}
          <div className="max-w-xl">
            <span
              className="inline-flex animate-hero-up items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-300"
              style={{ animationDelay: "0ms" }}
            >
              <Sparkles className="size-3.5" aria-hidden />
              Your Learning Journey Starts Here
            </span>

            <h1
              className="mt-6 animate-hero-up text-4xl leading-[1.1] font-extrabold tracking-tight text-white text-balance sm:text-5xl lg:text-[3.4rem]"
              style={{ animationDelay: "75ms" }}
            >
              Find Your{" "}
              <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                Ideal Tutor
              </span>{" "}
              or{" "}
              <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                Mentorship Batch
              </span>{" "}
              Today
            </h1>

            <p
              className="mt-5 animate-hero-up text-base leading-relaxed text-zinc-400 text-pretty sm:text-lg"
              style={{ animationDelay: "150ms" }}
            >
              MentorLagbe connects students with experienced tutors and
              structured mentorship programs — compare profiles, book sessions,
              and learn on your schedule, all in one place.
            </p>

            <div
              className="mt-8 flex animate-hero-up flex-col gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: "225ms" }}
            >
              <Link
                href="/tuitions"
                className="btn-shine group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-500 px-7 text-[15px] font-medium whitespace-nowrap text-white shadow-lg shadow-brand-500/35 transition-all select-none hover:bg-brand-400 hover:shadow-xl hover:shadow-brand-500/45 active:translate-y-px focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none sm:w-auto"
              >
                Browse Tuitions
                <ArrowRight
                  className="transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-7 text-[15px] font-medium whitespace-nowrap text-zinc-100 transition-all select-none hover:border-white/25 hover:bg-white/10 hover:text-white active:translate-y-px focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none sm:w-auto"
              >
                Explore Pro Plans
              </Link>
            </div>
          </div>

          {/* Right content */}
          <div
            className="relative mx-auto w-full max-w-[560px] animate-hero-up lg:max-w-none"
            style={{ animationDelay: "150ms" }}
          >
            {/* Concentric rings behind the scene */}
            <span
              aria-hidden
              className="absolute top-1/2 left-1/2 size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5"
            />
            <span
              aria-hidden
              className="absolute top-1/2 left-1/2 size-[19rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5"
            />
            <span
              aria-hidden
              className="absolute top-1/2 left-1/2 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/15 blur-[90px]"
            />

            <HeroIllustration />

            {/* Floating info cards */}
            {FLOATING_CARDS.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.title}
                  className={`absolute ${card.position} ${card.animation} flex items-center gap-2.5 rounded-xl border border-white/10 bg-ink-900/90 px-3 py-2.5 shadow-xl shadow-black/40 backdrop-blur-md`}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-500/15 text-brand-400 sm:size-9">
                    <Icon className="size-4 sm:size-4.5" aria-hidden />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-xs font-semibold text-white sm:text-sm">
                      {card.title}
                    </span>
                    <span className="block text-[10px] text-zinc-400 sm:text-xs">
                      {card.subtitle}
                    </span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

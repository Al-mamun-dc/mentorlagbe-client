"use client"

import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { usePathname,useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Crown,
  House,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react"

import { cn } from "cn"

/* ------------------------------- Nav links ------------------------------- */

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: House },
  { label: "Browse Tuitions", href: "/tuitions", icon: BookOpen },
  { label: "Pricing / Pro Plans", href: "/pricing", icon: Crown },
  { label: "How It Works", href: "/About", icon: Info },
]
/* --------------------------------- Brand --------------------------------- */

/** MentorLagbe mark: a graduation cap floating above an open book. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn("size-9", className)}
    >
      <defs>
        <linearGradient
          id="mentorlagbe-cap"
          x1="5"
          y1="3"
          x2="43"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF7B9C" />
          <stop offset="1" stopColor="#E82D68" />
        </linearGradient>
        <linearGradient
          id="mentorlagbe-book"
          x1="7"
          y1="30"
          x2="41"
          y2="45"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF8CAC" />
          <stop offset="1" stopColor="#E12C64" />
        </linearGradient>
      </defs>

      {/* Mortarboard */}
      <path d="M24 3 43 11.5 24 20 5 11.5Z" fill="url(#mentorlagbe-cap)" />
      {/* Cap base */}
      <path
        d="M17 15.7v5.4c0 2.7 4 4.4 7 4.4s7-1.7 7-4.4v-5.4l-7 3.1-7-3.1Z"
        fill="#B41350"
      />
      {/* Tassel */}
      <path
        d="M43 12v7.5"
        stroke="#FF9FB8"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="43" cy="21.5" r="2" fill="#FF9FB8" />
      {/* Board button */}
      <circle cx="24" cy="11.5" r="1.7" fill="#FFD3E0" />

      {/* Open book */}
      <path
        d="M23 34.2c-4-3.4-10.2-4.1-16-2.4v10.8c5.8-1.7 12-1 16 2.4V34.2Z"
        fill="url(#mentorlagbe-book)"
      />
      <path
        d="M25 34.2c4-3.4 10.2-4.1 16-2.4v10.8c-5.8-1.7-12-1-16 2.4V34.2Z"
        fill="url(#mentorlagbe-book)"
      />
    </svg>
  )
}

/** "Mentor" in white + "Lagbe" in brand pink. Designed for dark surfaces. */
export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn("text-lg font-extrabold tracking-tight", className)}
      aria-hidden="true"
    >
      <span className="text-white">Mentor</span>
      <span className="text-brand-500">Lagbe</span>
    </span>
  )
}

/* -------------------------------- Helpers -------------------------------- */

const FOCUS_RING = "focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none"

function getInitials(name?: string | null) {
  if (!name) return "U"
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
  )
}

function isActivePathname(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

/* ------------------------------- Component ------------------------------- */


export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  const { data: session } = authClient.useSession()
  const user = session?.user

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const userMenuRef = useRef<HTMLDivElement>(null)

  // Sign out function
  const handleSignOut = async () => {
    try {
      await authClient.signOut()

      setUserMenuOpen(false)
      setMobileOpen(false)

      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }


  // Elevate the navbar once the page is scrolled.
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Escape closes any open overlay.
  useEffect(() => {
    if (!mobileOpen && !userMenuOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false)
        setUserMenuOpen(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [mobileOpen, userMenuOpen])

  // Click outside closes the account dropdown.
  useEffect(() => {
    if (!userMenuOpen) return
    function onPointerDown(event: PointerEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [userMenuOpen])

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  // Auto-close the drawer when the viewport grows into desktop layout.
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)")
    function onChange(event: MediaQueryListEvent) {
      if (event.matches) setMobileOpen(false)
    }
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])

  return (
    <header
  className={cn(
    "fixed top-0 z-40 transition-all duration-300",
    pathname.startsWith("/dashboard")
      ? "left-64 w-[calc(100%-16rem)]"
      : "inset-x-0",
    scrolled ? "pt-2" : "pt-3 sm:pt-4"
  )}
>
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-5">
        <nav
          aria-label="Main navigation"
          className={cn(
            "relative flex h-14 items-center gap-2 rounded-2xl border bg-ink-900 pr-2.5 pl-3 transition-all duration-300 sm:gap-3",
            scrolled
              ? "border-white/10 bg-ink-900/90 shadow-2xl shadow-black/40 backdrop-blur-xl"
              : "border-white/6 bg-ink-900/70 shadow-lg shadow-black/20 backdrop-blur-md"
          )}
        >
          {/* Hairline glows */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-brand-500/70 to-transparent"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-6 -bottom-px h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
          />

          {/* Brand */}
          <Link
            href="/"
            aria-label="MentorLagbe — home"
            className={cn(
              "group flex shrink-0 items-center gap-2.5 rounded-xl py-1 pr-2",
              FOCUS_RING
            )}
          >
            <BrandMark className="size-8 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110 sm:size-9" />
            <BrandWordmark />
          </Link>

          <span aria-hidden className="hidden h-7 w-px shrink-0 bg-white/10 lg:block" />

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActivePathname(pathname, item.href)
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200",
                      FOCUS_RING,
                      active
                        ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30"
                        : "text-zinc-300 hover:bg-white/[0.07] hover:text-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 transition-transform duration-300",
                        active
                          ? "scale-110"
                          : "group-hover:-rotate-6 group-hover:scale-110"
                      )}
                    />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Right cluster */}
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  className={cn(
                    "flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pr-2.5 pl-1.5 transition hover:border-white/20 hover:bg-white/10",
                    FOCUS_RING
                  )}
                >
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt=""
                      className="size-7 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-bold text-white">
                      {getInitials(user.name)}
                    </span>
                  )}
                  <span className="hidden max-w-28 truncate text-sm font-medium text-zinc-100 sm:block">
                    {user.name ?? "Account"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 text-zinc-400 transition-transform",
                      userMenuOpen && "rotate-180"
                    )}
                  />
                </button>

                {userMenuOpen && (
                  <div
                    role="menu"
                    aria-label="Account menu"
                    className="absolute top-[calc(100%+10px)] right-0 z-50 w-56 origin-top-right animate-in fade-in-0 zoom-in-95 rounded-lg border border-white/10 bg-ink-900/95 p-1 text-sm text-zinc-100 shadow-xl ring-1 ring-white/10 duration-100 backdrop-blur-xl"
                  >
                    <div className="px-1.5 py-1 text-xs font-medium text-zinc-400">
                      Signed in as
                    </div>
                    <div className="-mt-1 truncate px-1.5 text-sm text-zinc-100">
                      {user.email ?? user.name}
                    </div>
                    <div className="-mx-1 my-1 h-px bg-white/10" />
                    <Link
                      href="/dashboard"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-1.5 rounded-md px-1.5 py-1.5 hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none"
                    >
                      <LayoutDashboard className="size-4 text-zinc-400" />
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                     onClick={handleSignOut}
                      className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1.5 text-red-400 hover:bg-red-500/10 focus-visible:bg-red-500/10 focus-visible:outline-none"
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 lg:flex">
                <Link
                  href="/sign-in"
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-medium whitespace-nowrap text-zinc-100 transition-all select-none hover:bg-white/10 hover:text-white active:translate-y-px"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="btn-shine group inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4.5 text-sm font-medium whitespace-nowrap text-white shadow-lg shadow-brand-500/30 transition-all select-none hover:bg-brand-400 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-px"
                >
                  Sign Up
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </div>
            )}

            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-controls="mobile-navigation"
              aria-expanded={mobileOpen}
              className={cn(
                "grid size-10 place-items-center rounded-xl text-zinc-200 transition hover:bg-white/10 hover:text-white lg:hidden",
                FOCUS_RING
              )}
            >
              <Menu className="size-5" />
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile drawer (kept mounted so it can animate in and out) */}
      <div
        inert={!mobileOpen}
        aria-hidden={!mobileOpen}
        className={cn("fixed inset-0 z-50 lg:hidden", !mobileOpen && "pointer-events-none")}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={cn(
            "absolute inset-y-0 right-0 flex w-80 max-w-[88vw] flex-col border-l border-white/10 bg-ink-950/95 text-zinc-100 shadow-2xl backdrop-blur-xl transition-transform duration-200 ease-out",
            mobileOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div className="flex items-center gap-2.5">
              <BrandMark className="size-9" />
              <BrandWordmark />
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className={cn(
                "grid size-9 place-items-center rounded-xl text-zinc-300 transition hover:bg-white/10 hover:text-white",
                FOCUS_RING
              )}
            >
              <X className="size-5" />
            </button>
          </div>
          <p className="border-b border-white/10 px-4 pb-3 text-sm text-zinc-400">
            Find the right tutor for every goal.
          </p>

          <nav
            aria-label="Mobile navigation"
            className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4"
          >
            {NAV_ITEMS.map((item, index) => {
              const active = isActivePathname(pathname, item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMobileOpen(false)}
                  style={{ animationDelay: `${90 + index * 45}ms` }}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-[15px] font-medium transition-colors",
                    mobileOpen && "animate-nav-item",
                    active
                      ? "bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-lg border transition-colors",
                      active
                        ? "border-brand-500/40 bg-brand-500/15 text-brand-300"
                        : "border-white/10 bg-white/5 text-zinc-300 group-hover:text-white"
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  {item.label}
                  <ArrowRight className="ml-auto size-4 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto border-t border-white/10 p-4">
            {user ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 text-sm font-medium text-zinc-100 transition-all select-none hover:bg-white/10 active:translate-y-px"
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Link>
                <button
                  type="button"
                 onClick={handleSignOut}
                  className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-red-500/15 text-sm font-medium text-red-400 transition-all select-none hover:bg-red-500/25 active:translate-y-px"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 text-[15px] font-medium text-zinc-100 transition-all select-none hover:bg-white/10 active:translate-y-px"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="btn-shine inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-brand-500 text-[15px] font-medium text-white shadow-lg shadow-brand-500/25 transition-all select-none hover:bg-brand-400 active:translate-y-px"
                >
                  Sign Up
                  <ArrowRight className="size-4" />
                </Link>
                <p className="text-center text-xs text-zinc-500">
                  Join MentorLagbe — it&apos;s free.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  ) 
}

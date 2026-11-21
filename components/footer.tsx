
"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { usePathname } from "next/navigation";

import { BrandMark, BrandWordmark } from "@/components/navbar";
import { cn } from "cn";

/* ------------------------------ Brand icons ------------------------------ */
/* Lucide no longer ships brand logos, so the social marks are inline SVGs.  */

function FacebookLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedinLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

/** The new X logo (not the old Twitter bird). */
function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

/* ------------------------------ Footer content ----------------------------- */

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Browse Tuitions", href: "/tuitions" },
  { label: "Pricing / Pro Plans", href: "/pricing" },
  { label: "How It Works", href: "/about" },
];

interface SocialLink {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

/* TODO: point these at MentorLagbe's official profiles once created. */
const SOCIAL_LINKS: SocialLink[] = [
  { label: "Facebook", href: "https://www.facebook.com/mentorlagbe", icon: FacebookLogo },
  { label: "Instagram", href: "https://www.instagram.com/mentorlagbe", icon: InstagramLogo },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/mentorlagbe", icon: LinkedinLogo },
  { label: "X", href: "https://x.com/mentorlagbe", icon: XLogo },
];

/* TODO: replace with the real contact details — these are placeholders. */
const CONTACT_ITEMS = [
  { icon: Mail, label: "support@mentorlagbe.com", href: "mailto:support@mentorlagbe.com" },
  { icon: Phone, label: "+880 1XXX-XXXXXX", href: null },
  { icon: MapPin, label: "Dhaka, Bangladesh", href: null },
];

/* --------------------------------- Footer --------------------------------- */

export function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();

  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <footer
      className={cn(
        "px-3 pt-8 pb-3 sm:px-5 sm:pb-5",
        isDashboard ? "md:ml-64" : "ml-0"
      )}
    >
      <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-charcoal text-zinc-300 shadow-2xl shadow-black/30">
        {/* Ambient glows — echoes the navbar's hairline highlights */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/70 to-transparent"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[36rem] -translate-x-1/2 rounded-full bg-brand-500/10 blur-[110px]"
        />

        <div className="relative grid gap-10 px-6 py-12 sm:grid-cols-2 sm:px-10 lg:grid-cols-[1.45fr_1fr_1.25fr] lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              aria-label="MentorLagbe — home"
              className="group inline-flex items-center gap-3 rounded-xl py-1 pr-2 focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none"
            >
              <BrandMark className="size-10 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110" />
              <BrandWordmark className="text-xl" />
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-400">
              Find the right tutor and make learning easier — MentorLagbe
              connects students with trusted mentors across Bangladesh.
            </p>

            <h2 className="sr-only">Follow MentorLagbe</h2>

            <div className="mt-6 flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`MentorLagbe on ${social.label}`}
                    className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/60 hover:bg-brand-500 hover:text-white hover:shadow-lg hover:shadow-brand-500/40 focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:outline-none"
                  >
                    <Icon className="size-4.5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick navigation */}
          <nav aria-label="Footer">
            <h2 className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
              <span aria-hidden className="size-1.5 rounded-full bg-brand-500" />
              Quick Links
            </h2>

            <ul className="mt-5 space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors duration-200 focus-visible:outline-none"
                  >
                    <span
                      aria-hidden
                      className="h-px w-0 bg-brand-500 transition-all duration-300 group-hover:w-4"
                    />
                    <span className="transition-colors duration-200 group-hover:text-brand-300">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact information */}
          <div>
            <h2 className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
              <span aria-hidden className="size-1.5 rounded-full bg-brand-500" />
              Get in Touch
            </h2>

            <address className="mt-5 space-y-4 not-italic">
              {CONTACT_ITEMS.map((item) => {
                const Icon = item.icon;

                const label = (
                  <span className="text-sm text-zinc-400 transition-colors duration-200 group-hover:text-zinc-200">
                    {item.label}
                  </span>
                );

                return (
                  <div key={item.label} className="group flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-brand-500 transition-all duration-300 group-hover:border-brand-500/40 group-hover:bg-brand-500/10">
                      <Icon className="size-4" />
                    </span>

                    {item.href ? (
                      <a href={item.href} className="focus-visible:outline-none">
                        {label}
                      </a>
                    ) : (
                      label
                    )}
                  </div>
                );
              })}
            </address>
          </div>
        </div>

        {/* Copyright */}
        <div className="relative border-t border-white/10 px-6 py-5 text-center text-sm text-zinc-500 sm:px-10">
          <p>&copy; {year} MentorLagbe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

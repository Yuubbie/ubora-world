"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";

/*
  Icons are inline SVG, not Unicode glyphs. Characters like the house or
  clock symbol render as emoji on some Android builds, as a blank box on
  others, and differently again on iOS - which made the nav look different
  on every device. SVG renders identically everywhere and inherits colour.
*/

function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function IconCbt() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5" />
      <path d="M9 2h6" />
    </svg>
  );
}

function IconSummaries() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5a2 2 0 0 1 2-2h11a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2z" />
      <path d="M8 7h6M8 11h6M8 15h4" />
    </svg>
  );
}

function IconSubscribe() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function IconSignOut() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const links = [
  { href: "/dashboard", label: "Dashboard", Icon: IconDashboard },
  { href: "/cbt", label: "CBT Practice", Icon: IconCbt },
  { href: "/summaries", label: "Summaries", Icon: IconSummaries },
  { href: "/subscribe", label: "Subscribe", Icon: IconSubscribe },
];

function isActive(pathname: string, href: string) {
  return href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname === href || pathname.startsWith(href + "/");
}

function TierBadge({ tier }: { tier: string | null }) {
  return (
    <span
      className="font-mono-brand text-xs px-3 py-1.5 rounded-full whitespace-nowrap inline-block"
      style={{ background: tier ? "#EEF3F0" : "#F6E3E0", color: tier ? "#2E7D5B" : "#B23A2E" }}
    >
      {tier ? `${tier} - active` : "no active plan"}
    </span>
  );
}

export default function PortalNav({
  tier,
  userName,
}: {
  tier: string | null;
  userName?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 md:min-h-screen md:sticky md:top-0 bg-ink text-white px-5 py-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 mb-1">
          <img src="/brand/ubora-icon-navy.svg" alt="Ubora World" className="h-9 w-9 rounded-xl object-cover shrink-0 bg-white/10" />
          <span className="font-display font-semibold text-lg tracking-tight whitespace-nowrap">Ubora World</span>
        </Link>
        <p className="text-xs text-white/50 mb-8 pl-[46px]">NOUN &middot; WAEC &middot; NECO &middot; JAMB</p>

        <nav className="flex flex-col gap-1 flex-1">
          {links.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={`w-[18px] shrink-0 ${active ? "text-gold" : ""}`}>
                  <Icon />
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="mb-3"><TierBadge tier={tier} /></div>
          <div className="flex items-center justify-between rounded-xl bg-white/5 px-3.5 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{userName || "Student"}</p>
              <p className="text-xs text-white/50">Student</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              aria-label="Sign out"
              className="text-white/50 hover:text-coral transition-colors shrink-0 ml-2"
            >
              <IconSignOut />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden border-b border-line bg-white sticky top-0 z-10">
        <div className="px-5 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <img src="/brand/ubora-icon-navy.svg" alt="Ubora World" className="h-8 w-8 rounded-full object-cover shrink-0" />
            <span className="font-display font-semibold text-lg tracking-tight whitespace-nowrap">Ubora World</span>
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="flex flex-col gap-1.5 p-2"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <span className="w-5 h-0.5 bg-ink block" />
            <span className="w-5 h-0.5 bg-ink block" />
            <span className="w-5 h-0.5 bg-ink block" />
          </button>
        </div>

        {open && (
          <div className="border-t border-line px-5 py-4 flex flex-col gap-1 bg-white">
            <div className="mb-3"><TierBadge tier={tier} /></div>
            {links.map(({ href, label, Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  /* Same pill treatment as desktop, so the active item reads
                     identically on both. */
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 ${
                    active ? "bg-ink text-white" : "text-ink/70 hover:bg-paper"
                  }`}
                >
                  <span className={`w-[18px] shrink-0 ${active ? "text-gold" : "text-muted"}`}>
                    <Icon />
                  </span>
                  {label}
                </Link>
              );
            })}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-coral hover:bg-coral/5 transition-colors duration-150 text-left"
            >
              <span className="w-[18px] shrink-0"><IconSignOut /></span>
              Sign out
            </button>
          </div>
        )}
      </div>
    </>
  );
}

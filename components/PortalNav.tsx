"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "⌂" },
  { href: "/cbt", label: "CBT Practice", icon: "⏱" },
  { href: "/summaries", label: "Summaries", icon: "▤" },
  { href: "/subscribe", label: "Subscribe", icon: "✦" },
];

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
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-base w-5 text-center">{l.icon}</span>
                {l.label}
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
              className="text-white/50 hover:text-coral transition-colors shrink-0 ml-2 text-lg"
            >
              ⏻
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
            aria-label="Menu"
          >
            <span className="w-5 h-0.5 bg-ink block" />
            <span className="w-5 h-0.5 bg-ink block" />
            <span className="w-5 h-0.5 bg-ink block" />
          </button>
        </div>

        {open && (
          <div className="border-t border-line px-5 py-4 flex flex-col gap-3 text-sm bg-white">
            <TierBadge tier={tier} />
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-1.5">
                {l.icon} &nbsp;{l.label}
              </Link>
            ))}
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-left text-coral py-1.5">
              Sign out
            </button>
          </div>
        )}
      </div>
    </>
  );
}
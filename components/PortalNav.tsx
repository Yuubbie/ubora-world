"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function PortalNav({ tier }: { tier: string | null }) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/cbt", label: "CBT Practice" },
    { href: "/summaries", label: "Summaries" },
    { href: "/subscribe", label: "Subscribe" },
  ];

  return (
    <div className="border-b border-line bg-white sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-5 md:px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <img src="/brand/ubora-icon-navy.svg" alt="Ubora World" className="h-8 w-8 rounded-full object-cover shrink-0" />
          <span className="font-display font-semibold text-lg tracking-tight whitespace-nowrap">Ubora World</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink2 transition-colors">{l.label}</Link>
          ))}
          <span className="font-mono-brand text-xs px-3 py-1.5 rounded-full whitespace-nowrap" style={{ background: tier ? "#EEF3F0" : "#F6E3E0", color: tier ? "#2E7D5B" : "#B23A2E" }}>
            {tier ? `${tier} - active` : "no active plan"}
          </span>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-muted hover:text-coral transition-colors">
            Sign out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Menu"
        >
          <span className="w-5 h-0.5 bg-ink block" />
          <span className="w-5 h-0.5 bg-ink block" />
          <span className="w-5 h-0.5 bg-ink block" />
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-line px-5 py-4 flex flex-col gap-3 text-sm bg-white">
          <span className="font-mono-brand text-xs px-3 py-1.5 rounded-full self-start" style={{ background: tier ? "#EEF3F0" : "#F6E3E0", color: tier ? "#2E7D5B" : "#B23A2E" }}>
            {tier ? `${tier} - active` : "no active plan"}
          </span>
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-1.5">{l.label}</Link>
          ))}
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-left text-coral py-1.5">
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
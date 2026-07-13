"use client";
import { useState } from "react";
import { TIER_PRICES_KOBO } from "@/lib/config";

const TIERS: { id: "basic" | "standard" | "premium"; label: string; features: string[]; highlight?: boolean }[] = [
  { id: "basic", label: "Basic", features: ["Past questions", "Course summaries (view only)"] },
  { id: "standard", label: "Standard", features: ["Everything in Basic", "CBT practice engine"], highlight: true },
  { id: "premium", label: "Premium", features: ["Everything in Standard", "Video & audio tutorials", "Downloadable summaries"] },
];

export default function SubscribePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subscribe(tier: string) {
    setLoading(tier);
    setError(null);
    const res = await fetch("/api/payments/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) {
      setError(data.error ?? "Could not start checkout");
      return;
    }
    window.location.href = data.authorizationUrl;
  }

  return (
    <div className="bg-dot-grid min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-14">
        <p className="eyebrow text-golddeep mb-3 animate-fade-up" style={{ opacity: 0 }}>
          Pricing
        </p>
        <h1
          className="font-display text-3xl md:text-4xl font-bold mb-2 tracking-tight animate-fade-up"
          style={{ animationDelay: "0.05s", opacity: 0 }}
        >
          Choose your <span className="italic font-medium text-gold">plan</span>.
        </h1>
        <p className="text-muted mb-10 animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
          Per semester (3 months). Renews manually - no surprise charges.
        </p>
        {error && <p className="text-coral mb-4 font-medium">{error}</p>}
        <div className="grid sm:grid-cols-3 gap-5">
          {TIERS.map((t, i) => (
            <div
              key={t.id}
              className={`card-premium flex flex-col p-7 animate-fade-up-scale ${t.highlight ? "border-2 border-gold shadow-cardHover" : ""}`}
              style={{ animationDelay: `${0.15 + i * 0.05}s`, opacity: 0 }}
            >
              {t.highlight && (
                <span className="eyebrow self-start mb-3 rounded-full bg-gold/15 px-2.5 py-1 text-[10px] text-golddeep">
                  Most Popular
                </span>
              )}
              <h3 className="font-display font-bold text-xl mb-3 tracking-tight">{t.label}</h3>
              <p className="font-mono-brand mb-6">
                <span className="text-sm text-muted mr-1">NGN</span>
                <span className="text-3xl font-semibold text-ink">
                  {(TIER_PRICES_KOBO[t.id] / 100).toLocaleString()}
                </span>
              </p>
              <ul className="text-sm text-muted mb-8 flex-1 space-y-2.5">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-green mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => subscribe(t.id)}
                disabled={loading !== null}
                className={`group text-sm disabled:opacity-50 disabled:pointer-events-none ${t.highlight ? "btn-gold" : "btn-primary"}`}
              >
                <span>{loading === t.id ? "Redirecting..." : `Subscribe to ${t.label}`}</span>
                {loading !== t.id && (
                  <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">→</span>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
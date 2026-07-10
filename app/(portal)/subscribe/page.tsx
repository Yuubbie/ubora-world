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
    <div className="max-w-4xl mx-auto px-6 py-12">
      <p className="font-mono-brand text-xs uppercase tracking-widest mb-2" style={{ color: "#8C6D1F" }}>Pricing</p>
      <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2 tracking-tight">Choose your plan</h1>
      <p className="text-muted mb-10">Per semester (3 months). Renews manually - no surprise charges.</p>
      {error && <p className="text-coral mb-4">{error}</p>}
      <div className="grid sm:grid-cols-3 gap-5">
        {TIERS.map((t) => (
          <div
            key={t.id}
            className={`card-hover bg-white rounded-2xl p-6 flex flex-col ${t.highlight ? "border-2" : "border border-line"}`}
            style={t.highlight ? { borderColor: "#C99A2E" } : {}}
          >
            {t.highlight && (
              <span className="font-mono-brand text-xs font-semibold px-2.5 py-1 rounded-full self-start mb-3" style={{ background: "#EFEAD9", color: "#8C6D1F" }}>
                MOST POPULAR
              </span>
            )}
            <h3 className="font-display font-semibold text-xl mb-1">{t.label}</h3>
            <p className="mb-5 flex items-baseline gap-0.5">
              <span className="font-sans text-2xl font-semibold">NGN</span>
              <span className="font-display text-3xl font-semibold">
                {(TIER_PRICES_KOBO[t.id] / 100).toLocaleString()}
              </span>
            </p>
            <ul className="text-sm text-muted mb-7 flex-1 space-y-2">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span style={{ color: "#2E7D5B" }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => subscribe(t.id)}
              disabled={loading !== null}
              className="rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50 transition-colors"
              style={t.highlight ? { background: "#C99A2E", color: "#16233F" } : { background: "#16233F", color: "#fff" }}
            >
              {loading === t.id ? "Redirecting..." : `Subscribe to ${t.label}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
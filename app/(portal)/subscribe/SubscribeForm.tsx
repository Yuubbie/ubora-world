"use client";
import { useState } from "react";
import { TIER_PRICES_KOBO, type BillingCycle } from "@/lib/config";

const TIERS: { id: "basic" | "standard" | "premium"; label: string; features: string[]; highlight?: boolean }[] = [
  { id: "basic", label: "Basic", features: ["Past questions", "Course summaries (view only)"] },
  { id: "standard", label: "Standard", features: ["Everything in Basic", "CBT practice engine"], highlight: true },
  { id: "premium", label: "Premium", features: ["Everything in Standard", "Video & audio tutorials", "Downloadable summaries"] },
];

export default function SubscribeForm() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Track which billing cycle the user has selected for payment (defaults to semester)
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>("semester");

  async function subscribe(tier: string) {
    setLoading(tier);
    setError(null);
    const res = await fetch("/api/payments/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier, cycle: selectedCycle }),
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
    <div className="max-w-4xl mx-auto px-6 py-14">
      <p className="eyebrow text-golddeep mb-3 animate-fade-up" style={{ opacity: 0, animationFillMode: "forwards" }}>
        Pricing & Subscriptions
      </p>
      
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1
            className="font-display text-3xl md:text-4xl font-bold mb-2 tracking-tight animate-fade-up"
            style={{ animationDelay: "0.05s", opacity: 0, animationFillMode: "forwards" }}
          >
            Choose your <span className="italic font-medium text-gold">plan</span>.
          </h1>
          <p className="text-muted animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards" }}>
            Select your preferred billing cycle below, then choose your plan to checkout securely via Paystack.
          </p>
        </div>

        {/* Global Cycle Selector for Checkout */}
        <div 
          className="flex items-center p-1 bg-surface-alt rounded-lg border border-line w-fit animate-fade-up"
          style={{ animationDelay: "0.15s", opacity: 0, animationFillMode: "forwards" }}
        >
          <button
            type="button"
            onClick={() => setSelectedCycle("monthly")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedCycle === "monthly" ? "bg-white shadow-sm text-ink font-bold" : "text-muted hover:text-ink"
            }`}
          >
            Billing: Monthly (30 days)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCycle("semester")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedCycle === "semester" ? "bg-white shadow-sm text-ink font-bold" : "text-muted hover:text-ink"
            }`}
          >
            Billing: Semester (90 days)
          </button>
        </div>
      </div>

      {error && <p className="text-coral mb-4 font-medium">{error}</p>}
      
      <div className="grid sm:grid-cols-3 gap-5">
        {TIERS.map((t, i) => (
          <div
            key={t.id}
            className={`card-premium flex flex-col p-7 animate-fade-up-scale ${t.highlight ? "border-2 border-gold shadow-cardHover" : ""}`}
            style={{ animationDelay: `${0.2 + i * 0.05}s`, opacity: 0, animationFillMode: "forwards" }}
          >
            {t.highlight && (
              <span className="eyebrow self-start mb-3 rounded-full bg-gold/15 px-2.5 py-1 text-[10px] text-golddeep">
                Most Popular
              </span>
            )}
            <h3 className="font-display font-bold text-xl mb-3 tracking-tight">{t.label}</h3>

            {/* Display Both Tariffs Clearly inside the Dashboard */}
            <div className="space-y-2 mb-6 pb-4 border-b border-line">
              <div className={`flex items-center justify-between text-sm p-2 rounded-lg ${selectedCycle === "monthly" ? "bg-gold/10 border border-gold/40" : ""}`}>
                <span className="text-muted">Monthly (30d)</span>
                <span className="font-mono-brand font-semibold">
                  ₦{(TIER_PRICES_KOBO[t.id].monthly / 100).toLocaleString()}
                </span>
              </div>
              <div className={`flex items-center justify-between text-sm p-2 rounded-lg ${selectedCycle === "semester" ? "bg-gold/10 border border-gold/40" : ""}`}>
                <span className="font-medium text-ink">Semester (90d)</span>
                <span className="font-mono-brand font-bold text-golddeep">
                  ₦{(TIER_PRICES_KOBO[t.id].semester / 100).toLocaleString()}
                </span>
              </div>
            </div>

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
              <span>
                {loading === t.id 
                  ? "Redirecting..." 
                  : `Pay for ${selectedCycle === "monthly" ? "Month" : "Semester"} (${t.label})`}
              </span>
              {loading !== t.id && (
                <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">→</span>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
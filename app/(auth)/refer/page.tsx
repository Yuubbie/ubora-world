"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BackLink from "@/components/BackLink";
import PasswordField from "@/components/PasswordField";

export default function ReferrerSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/referrer-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.formErrors?.[0] ?? data.error ?? "Something went wrong.");
      return;
    }
    router.push("/login?created=referrer");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="mb-6">
        <BackLink href="/" label="Home" />
      </div>
      <a href="/" className="flex items-center gap-3 mb-8">
        <img src="/brand/ubora-logo.jpeg" alt="Ubora World" className="h-12 w-12 rounded-xl object-cover" />
        <span className="font-display font-bold text-2xl tracking-tight">Ubora World</span>
      </a>
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-line rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-1">Refer and earn</h1>
        <p className="text-sm text-muted mb-6">
          You do not need a student account. Share your link. You earn ₦500 when a friend pays monthly, or ₦1,000 when they take a semester plan. Free trials do not count.
        </p>
        {error && <p className="text-sm text-coral mb-4">{typeof error === "string" ? error : "Something went wrong."}</p>}
        <div className="mb-4">
          <label className="text-sm font-medium block mb-1.5">Full name</label>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label className="text-sm font-medium block mb-1.5">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="text-sm font-medium block mb-1.5">Phone (WhatsApp)</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm"
          />
        </div>
        <PasswordField
          value={form.password}
          onChange={(password) => setForm({ ...form, password })}
          autoComplete="new-password"
          minLength={8}
          className="mb-4"
        />
        <button
          disabled={loading}
          className="w-full bg-ink text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50 mt-2"
        >
          {loading ? "Creating profile…" : "Create referral profile"}
        </button>
        <p className="text-sm text-muted mt-5 text-center">
          Already have a profile?{" "}
          <a href="/login" className="text-ink2 font-semibold hover:text-gold transition-colors duration-150">
            Log in
          </a>
        </p>
        <p className="text-sm text-muted mt-3 text-center">
          Need CBT practice?{" "}
          <a href="/signup" className="text-ink2 font-semibold hover:text-gold transition-colors duration-150">
            Start a student trial
          </a>
        </p>
      </form>
    </div>
  );
}

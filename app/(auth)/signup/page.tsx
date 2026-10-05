"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BackLink from "@/components/BackLink";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", matricNumber: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/signup", {
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
    router.push("/login");
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
        <h1 className="text-2xl font-semibold mb-1">Create your account</h1>
        <p className="text-sm text-muted mb-6">
          30 days of Premium free — CBT, summaries, and Ask the Tutor. Then log in and pick your faculty.
        </p>
        {error && <p className="text-sm text-coral mb-4">{error}</p>}
        {[
          { key: "fullName", label: "Full name", type: "text" },
          { key: "email", label: "Email", type: "email" },
          { key: "matricNumber", label: "Matric number (optional)", type: "text" },
          { key: "password", label: "Password", type: "password" },
        ].map((f) => (
          <div key={f.key} className="mb-4">
            <label className="text-sm font-medium block mb-1.5">{f.label}</label>
            <input
              type={f.type}
              value={(form as any)[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm"
            />
          </div>
        ))}
        <button
          disabled={loading}
          className="w-full bg-ink text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50 mt-2"
        >
          {loading ? "Creating account…" : "Start 30-day free trial"}
        </button>
        <p className="text-sm text-muted mt-5 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-ink2 font-semibold hover:text-gold transition-colors duration-150">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}

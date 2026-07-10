"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-line rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-1">Create your account</h1>
        <p className="text-sm text-muted mb-6">Subscriptions are activated after payment (Phase 2).</p>
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
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>
    </div>
  );
}

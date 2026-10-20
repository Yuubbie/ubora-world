"use client";

import { useState } from "react";
import BackLink from "@/components/BackLink";
import { ENQUIRY_NUMBER } from "@/lib/config";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanPhone = ENQUIRY_NUMBER.replace(/\s+/g, "");
  const whatsappNumber = cleanPhone.startsWith("0") ? `234${cleanPhone.slice(1)}` : cleanPhone;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello, I need a password reset for my Ubora World account.")}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not send a reset link.");
      return;
    }
    setDone(true);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="mb-6">
        <BackLink href="/login" label="Log in" />
      </div>
      <a href="/" className="flex items-center gap-3 mb-8">
        <img src="/brand/ubora-logo.jpeg" alt="Ubora World" className="h-12 w-12 rounded-xl object-cover" />
        <span className="font-display font-bold text-2xl tracking-tight">Ubora World</span>
      </a>
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-line rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-1">Forgot password</h1>
        <p className="text-sm text-muted mb-6">
          Enter the email or phone on your account. We will send a one-hour reset link.
        </p>
        {error && <p className="text-sm text-coral mb-4">{error}</p>}
        {done ? (
          <div className="space-y-4 text-sm text-muted">
            <p>If an account exists for those details, a reset link will be sent to that inbox from Ubora World.</p>
            <p>Check spam and promotions. The link expires in one hour.</p>
            <p>Did not get it? Chat us on WhatsApp and we will send the link.</p>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-gold w-full text-center">
              Chat on WhatsApp
            </a>
            <p className="text-center">
              <a href="/login" className="font-semibold text-ink2 hover:text-gold">Back to log in</a>
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="text-sm font-medium block mb-1.5">Email or Phone</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm"
                required
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-ink text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

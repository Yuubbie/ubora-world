"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BackLink from "@/components/BackLink";
import PasswordField from "@/components/PasswordField";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Could not reset password.");
      return;
    }
    router.push("/login");
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
        <h1 className="text-2xl font-semibold mb-1">Set a new password</h1>
        <p className="text-sm text-muted mb-6">Choose a password of at least 8 characters, then log in.</p>
        {error && <p className="text-sm text-coral mb-4">{error}</p>}
        {!token && <p className="text-sm text-coral mb-4">This reset link is missing. Request a new one from the login page.</p>}
        <PasswordField
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={8}
          className="mb-4"
        />
        <PasswordField
          id="confirm-password"
          name="confirmPassword"
          label="Confirm password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          minLength={8}
          className="mb-6"
        />
        <button
          disabled={loading || !token}
          className="w-full bg-ink text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

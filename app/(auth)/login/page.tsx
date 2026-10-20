"use client";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import BackLink from "@/components/BackLink";
import PasswordField from "@/components/PasswordField";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justCreated = searchParams.get("created") === "1";
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      redirect: false,
      identifier: emailOrPhone,
      emailOrPhone,
      password,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email/phone or password.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
        <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
        <p className="text-sm text-muted mb-6">
          Log in to access your CBT practice and course summaries.
        </p>
        {justCreated && (
          <p className="mb-4 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-ink">
            Account created. Check your email from Ubora World, then log in. Your 10-day Premium trial (CBT, summaries, tutor) starts now.
          </p>
        )}
        {error && <p className="text-sm text-coral mb-4">{error}</p>}
        <div className="mb-4">
          <label className="text-sm font-medium block mb-1.5">Email or Phone</label>
          <input
            type="text"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm"
            required
          />
        </div>
        <PasswordField value={password} onChange={setPassword} className="mb-2" />
        <p className="mb-6 text-right text-sm">
          <a href="/forgot-password" className="font-semibold text-ink2 hover:text-gold transition-colors duration-150">
            Forgot password?
          </a>
        </p>
        <button
          disabled={loading}
          className="w-full bg-ink text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
        <p className="text-sm text-muted mt-5 text-center">
          New here?{" "}
          <a href="/signup" className="text-ink2 font-semibold hover:text-gold transition-colors duration-150">
            Create an account for 10 days free.
          </a>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginForm />
    </Suspense>
  );
}

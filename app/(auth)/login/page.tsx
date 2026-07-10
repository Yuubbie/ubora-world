"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { identifier, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Incorrect email/phone or password.");
    else router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-2 mb-8">
        <img src="/logo.jpg" alt="Ubora World" className="h-10 w-10 rounded" />
        <span className="uw-display font-semibold text-xl">Ubora World</span>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-line rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-1">Student login</h1>
        <p className="text-sm text-muted mb-6">
          Demo account — demo.student@uboraworld.test / Password123!
        </p>
        {error && <p className="text-sm text-coral mb-4">{error}</p>}
        <label className="text-sm font-medium block mb-1.5">Email or phone</label>
        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm mb-4"
        />
        <label className="text-sm font-medium block mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm mb-6"
        />
        <button
          disabled={loading}
          className="w-full bg-ink text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
        <p className="text-sm text-muted mt-4 text-center">
          No account? <a href="/signup" className="text-ink2 font-medium">Sign up</a>
        </p>
      </form>
    </div>
  );
}
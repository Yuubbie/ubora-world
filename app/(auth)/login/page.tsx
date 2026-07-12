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
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 bg-paper overflow-hidden">
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.12] blur-3xl pointer-events-none"
        style={{ top: "-120px", right: "-120px", background: "radial-gradient(circle, #C99A2E, transparent)" }}
      />
      <div className="relative flex items-center gap-3 mb-10 animate-fade-up">
        <img src="/brand/ubora-icon-navy.svg" alt="Ubora World" className="h-12 w-12 rounded" />
        <span className="font-display font-bold text-2xl tracking-tight">Ubora World</span>
      </div>
      <form
        onSubmit={handleSubmit}
        className="relative card-premium w-full max-w-sm p-9 animate-fade-up-scale"
        style={{ animationDelay: "0.1s", opacity: 0 }}
      >
        <p className="font-mono-brand text-xs tracking-[0.2em] uppercase text-gold mb-3">
          Secure Student Portal
        </p>
        <h1 className="font-display text-3xl font-bold mb-2 tracking-tight">Student login</h1>
        <p className="text-sm text-muted mb-7">
          Demo account — demo.student@uboraworld.test / Password123!
        </p>
        {error && <p className="text-sm text-coral mb-4 font-medium">{error}</p>}
        <label className="text-sm font-medium block mb-1.5">Email or phone</label>
        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-line text-base mb-5 transition-colors duration-150 hover:border-muted focus:border-gold focus:outline-none"
        />
        <label className="text-sm font-medium block mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-line text-base mb-7 transition-colors duration-150 hover:border-muted focus:border-gold focus:outline-none"
        />
        <button
          disabled={loading}
          className="btn-primary group w-full text-base py-3.5 disabled:opacity-50 disabled:pointer-events-none"
        >
          <span>{loading ? "Logging in…" : "Log in"}</span>
          {!loading && (
            <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">→</span>
          )}
        </button>
        <p className="text-sm text-muted mt-5 text-center">
          No account?{" "}
          <a href="/signup" className="text-ink2 font-semibold hover:text-gold transition-colors duration-150">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}
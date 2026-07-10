"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function SubscribeCallbackPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "success" | "failed">("checking");

  useEffect(() => {
    const reference = params.get("reference") ?? params.get("trxref");
    if (!reference) {
      setStatus("failed");
      return;
    }
    fetch(`/api/payments/verify?reference=${encodeURIComponent(reference)}`)
      .then((r) => r.json())
      .then((d) => setStatus(d.ok ? "success" : "failed"))
      .catch(() => setStatus("failed"));
  }, [params]);

  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      {status === "checking" && <p className="text-muted">Confirming your payment…</p>}
      {status === "success" && (
        <>
          <h1 className="text-2xl font-semibold mb-3">Subscription active</h1>
          <p className="text-muted mb-6">You're all set. Head to your dashboard to start.</p>
          <button onClick={() => router.push("/dashboard")} className="bg-ink text-white rounded-lg px-5 py-2.5 text-sm font-semibold">
            Go to dashboard
          </button>
        </>
      )}
      {status === "failed" && (
        <>
          <h1 className="text-2xl font-semibold mb-3 text-coral">Payment not confirmed</h1>
          <p className="text-muted mb-6">If you were charged, this usually resolves within a minute — try refreshing, or contact support.</p>
          <button onClick={() => router.push("/subscribe")} className="bg-ink text-white rounded-lg px-5 py-2.5 text-sm font-semibold">
            Back to plans
          </button>
        </>
      )}
    </div>
  );
}

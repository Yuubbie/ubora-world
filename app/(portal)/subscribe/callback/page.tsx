"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BackLink from "@/components/BackLink";

function CallbackContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "success" | "failed">("checking");
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    const reference = params.get("reference") ?? params.get("trxref");
    if (!reference) {
      setStatus("failed");
      setDetail("No payment reference was returned from checkout.");
      return;
    }
    fetch(`/api/payments/verify?reference=${encodeURIComponent(reference)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setStatus("success");
          return;
        }
        setStatus("failed");
        setDetail(d.reason ?? d.error ?? "Paystack charged, but Ubora could not confirm yet.");
      })
      .catch(() => {
        setStatus("failed");
        setDetail("Could not reach the confirmation endpoint. Refresh this page.");
      });
  }, [params]);

  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <div className="mb-6 text-left">
        <BackLink href="/subscribe" label="Plans" />
      </div>
      {status === "checking" && <p className="text-muted">Confirming your payment...</p>}
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
          <p className="text-muted mb-6">
            {detail ?? "If you were charged, refresh this page or send the Paystack reference to support so access can be granted."}
          </p>
          <button onClick={() => router.push("/subscribe")} className="bg-ink text-white rounded-lg px-5 py-2.5 text-sm font-semibold">
            Back to plans
          </button>
        </>
      )}
    </div>
  );
}

export default function SubscribeCallbackPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-6 py-20 text-center text-muted">Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReconcileButton({ reference }: { reference: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    if (loading) return;
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/admin/payments/reconcile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.ok) {
      setMessage(data.reason ?? data.error ?? "Could not grant access");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="text-sm font-medium bg-[#101B33] text-white hover:bg-black px-3 py-1.5 rounded-md disabled:opacity-50"
      >
        {loading ? "Checking Paystack..." : "Grant access"}
      </button>
      {message && <p className="text-xs text-red-600 max-w-[180px] text-right">{message}</p>}
    </div>
  );
}

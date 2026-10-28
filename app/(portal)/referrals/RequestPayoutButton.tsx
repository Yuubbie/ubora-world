"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RequestPayoutButton({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestPayout() {
    if (disabled || loading) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/referrals/payout", { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error === "nothing_payable" ? "Nothing is ready to request yet." : "Could not request payout.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={requestPayout}
        disabled={disabled || loading}
        className="btn-gold btn-sm disabled:opacity-50"
      >
        {loading ? "Requesting…" : "Request payout"}
      </button>
      {error ? <p className="text-xs text-coral">{error}</p> : null}
    </div>
  );
}

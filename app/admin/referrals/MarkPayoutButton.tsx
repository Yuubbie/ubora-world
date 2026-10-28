"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MarkPayoutButton({
  payoutId,
  action,
  label,
}: {
  payoutId: string;
  action: "paid" | "processing";
  label: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function run() {
    if (loading) return;
    setLoading(true);
    await fetch("/api/admin/referrals/payout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payoutId, action }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={loading}
      className="text-sm font-medium bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md disabled:opacity-50"
    >
      {loading ? "Saving…" : label}
    </button>
  );
}

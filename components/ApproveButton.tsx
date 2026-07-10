"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApproveButton({ type, id }: { type: string; id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function approve() {
    setLoading(true);
    const res = await fetch("/api/admin/content/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <button
      onClick={approve}
      disabled={loading}
      className="bg-green text-white rounded-lg px-3.5 py-2 text-xs font-semibold disabled:opacity-50"
    >
      {loading ? "Approving…" : "Approve"}
    </button>
  );
}

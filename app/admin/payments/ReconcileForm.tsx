"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReconcileForm() {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = reference.trim();
    if (!value || loading) return;
    setLoading(true);
    setMessage(null);
    setOk(false);
    const res = await fetch("/api/admin/payments/reconcile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: value }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.ok) {
      setMessage(data.reason ?? "Paystack did not confirm this charge");
      return;
    }
    setOk(true);
    setMessage(data.alreadyProcessed ? "Already granted. Access is active." : "Access granted.");
    setReference("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
      <h2 className="font-semibold text-[#101B33] mb-1">Grant access from a Paystack reference</h2>
      <p className="text-sm text-gray-500 mb-4">
        Paste the transaction reference from the Paystack dashboard. This verifies the charge live, then activates the student.
      </p>
      <div className="flex flex-col md:flex-row gap-3">
        <input
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          placeholder="uw_... or Paystack reference"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading || !reference.trim()}
          className="bg-[#101B33] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify and grant"}
        </button>
      </div>
      {message && <p className={`text-sm mt-3 ${ok ? "text-green-700" : "text-red-600"}`}>{message}</p>}
    </form>
  );
}

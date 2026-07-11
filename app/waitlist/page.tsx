"use client";
import { useState } from "react";

const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/HcnOnFikr3EFCImHJbkqVA";

export default function WaitlistPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    interest: "noun",
    referredBy: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? "done" : "error");
  }

  if (status === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#F3F5F4" }}>
        <div className="max-w-md text-center">
          <img src="/logo.jpg" alt="Ubora World" className="h-14 w-14 rounded-full object-cover mx-auto mb-6" />
          <h1 className="font-display text-3xl font-semibold mb-3" style={{ color: "#16233F" }}>You're on the list.</h1>
          <p className="text-muted mb-8">
            We'll message you on WhatsApp the moment Ubora World opens for your group.
          </p>
          <a href={WHATSAPP_GROUP_LINK} target="_blank" rel="noopener noreferrer" className="inline-block rounded-lg px-6 py-3 text-sm font-semibold" style={{ background: "#2E7D5B", color: "#fff" }}>Join the WhatsApp group</a>
          <p className="text-xs text-muted mt-4">
            Optional - for early updates and a place to ask questions before launch.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 py-14" style={{ background: "#16233F", color: "#fff" }}>
        <div className="flex items-center gap-2.5 mb-8">
          <img src="/logo.jpg" alt="Ubora World" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-display font-semibold text-xl">Ubora World</span>
        </div>
        <p className="font-mono-brand text-xs tracking-widest uppercase mb-4" style={{ color: "#C99A2E" }}>
          Coming soon
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-5">
          Be first to get in.
        </h1>
        <p className="text-white/75 max-w-md leading-relaxed">
          CBT practice, course summaries, past questions and tutorial videos - built for NOUN,
          WAEC, NECO and JAMB students. Join the waitlist and we'll notify you the moment it opens.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-8 py-14" style={{ background: "#F3F5F4" }}>
        <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border rounded-2xl p-6" style={{ borderColor: "#DCE1E6" }}>
          <h2 className="font-display text-2xl font-semibold mb-1" style={{ color: "#16233F" }}>Join the waitlist</h2>
          <p className="text-sm text-muted mb-6">Takes less than a minute.</p>

          <label className="text-sm font-medium block mb-1.5">Full name</label>
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm mb-4"
            style={{ borderColor: "#DCE1E6" }}
          />

          <label className="text-sm font-medium block mb-1.5">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm mb-4"
            style={{ borderColor: "#DCE1E6" }}
          />

          <label className="text-sm font-medium block mb-1.5">WhatsApp number</label>
          <input
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="e.g. 08012345678"
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm mb-4"
            style={{ borderColor: "#DCE1E6" }}
          />

          <label className="text-sm font-medium block mb-1.5">What are you most interested in?</label>
          <select
            value={form.interest}
            onChange={(e) => setForm({ ...form, interest: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm mb-4"
            style={{ borderColor: "#DCE1E6" }}
          >
            <option value="noun">NOUN - CBT, summaries &amp; tutorials</option>
            <option value="waec_neco_jamb">WAEC / NECO / JAMB prep</option>
            <option value="result_checker">Result checker for my child's school</option>
            <option value="not_sure">Not sure yet</option>
          </select>

          <label className="text-sm font-medium block mb-1.5">Referred by (optional)</label>
          <input
            value={form.referredBy}
            onChange={(e) => setForm({ ...form, referredBy: e.target.value })}
            placeholder="Agent or friend's name"
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm mb-6"
            style={{ borderColor: "#DCE1E6" }}
          />

          {status === "error" && (
            <p className="text-sm mb-4" style={{ color: "#B23A2E" }}>Something went wrong - please try again.</p>
          )}

          <button
            disabled={status === "loading"}
            className="w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
            style={{ background: "#16233F", color: "#fff" }}
          >
            {status === "loading" ? "Joining..." : "Join the waitlist"}
          </button>
        </form>
      </div>
    </div>
  );
}
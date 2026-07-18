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
      <div className="bg-dot-grid min-h-screen flex items-center justify-center px-6 bg-paper">
        <div className="card-premium max-w-md w-full text-center px-8 py-10 animate-fade-up-scale">
          <div className="slip-perforate h-3 w-full -mt-10 mb-8 rounded-t-3xl" />
          <img src="/brand/ubora-icon-navy.svg" alt="Ubora World" className="h-14 w-14 rounded-full object-cover mx-auto mb-6" />
          <p className="eyebrow text-gold mb-2">Confirmed</p>
          <h1 className="font-display text-3xl font-bold mb-3 text-ink tracking-tight">You're on the list.</h1>
          <p className="text-muted mb-8">
            We'll message you on WhatsApp the moment Ubora World opens for your group.
          </p>
          <a
           href={WHATSAPP_GROUP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold group inline-flex text-sm"
          >
            <span>Join the WhatsApp group</span>
            <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">›</span>
          </a>
          <p className="text-xs text-muted mt-4">
            Optional - for early updates and a place to ask questions before launch.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="bg-grain relative overflow-hidden flex-1 flex flex-col justify-center px-8 md:px-14 py-10 md:py-12 bg-ink text-white">
        <div
          className="absolute w-[380px] h-[380px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ top: "-100px", left: "-100px", background: "radial-gradient(circle, #C99A2E, transparent)" }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-7 animate-fade-up" style={{ opacity: 0 }}>
            <img src="/brand/ubora-icon-cream.svg" alt="Ubora World" className="h-11 w-11 rounded-full object-cover" />
            <span className="font-display font-bold text-xl tracking-tight">Ubora World</span>
          </div>
          <p className="eyebrow mb-4 text-gold animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
            Coming soon
          </p>
          <h1
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight mb-4 max-w-lg animate-fade-up"
            style={{ animationDelay: "0.15s", opacity: 0 }}
          >
            Be first to get in.
          </h1>
          <p
            className="text-white/80 text-base md:text-lg max-w-md leading-relaxed animate-fade-up"
            style={{ animationDelay: "0.2s", opacity: 0 }}
          >
            CBT practice, course summaries, past questions and tutorial videos - built for NOUN,
            WAEC, NECO and JAMB students. Join the waitlist and we'll notify you the moment it opens.
          </p>
        </div>
      </div>

      <div className="bg-dot-grid flex-1 flex items-center justify-center px-8 py-10 md:py-12">
        <form
          onSubmit={handleSubmit}
          className="card-premium w-full max-w-sm p-7 animate-fade-up-scale"
          style={{ animationDelay: "0.1s", opacity: 0 }}
        >
          <p className="eyebrow text-gold mb-3">Join us</p>
          <h2 className="font-display text-2xl font-bold mb-1 text-ink tracking-tight">Join the waitlist</h2>
          <p className="text-sm text-muted mb-6">Takes less than a minute.</p>

          <label className="text-sm font-medium block mb-1.5">Full name</label>
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm mb-4 transition-colors duration-150 hover:border-muted focus:border-gold focus:outline-none"
          />

          <label className="text-sm font-medium block mb-1.5">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm mb-4 transition-colors duration-150 hover:border-muted focus:border-gold focus:outline-none"
          />

          <label className="text-sm font-medium block mb-1.5">WhatsApp number</label>
          <input
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="e.g. 08012345678"
            className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm mb-4 transition-colors duration-150 hover:border-muted focus:border-gold focus:outline-none"
          />

          <label className="text-sm font-medium block mb-1.5">What are you most interested in?</label>
          <select
            value={form.interest}
            onChange={(e) => setForm({ ...form, interest: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm mb-4 transition-colors duration-150 hover:border-muted focus:border-gold focus:outline-none"
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
            className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm mb-6 transition-colors duration-150 hover:border-muted focus:border-gold focus:outline-none"
          />

          {status === "error" && (
            <p className="text-sm mb-4 text-coral font-medium">Something went wrong - please try again.</p>
          )}

          <button
            disabled={status === "loading"}
            className="btn-primary group w-full text-sm disabled:opacity-50 disabled:pointer-events-none"
          >
            <span>{status === "loading" ? "Joining..." : "Join the waitlist"}</span>
            {status !== "loading" && (
              <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">→</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
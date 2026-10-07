"use client";

import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";

type Msg = { id: string; sender: "visitor" | "admin"; content: string; createdAt: string };
type Thread = {
  id: string;
  status: "open" | "closed";
  name: string;
  email: string | null;
  signedIn: boolean;
  updatedAt: string;
  preview: string;
  messages: Msg[];
};

export default function AdminInquiriesPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/inquiry");
    const data = await res.json();
    setThreads(data.threads || []);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  const active = threads.find((t) => t.id === activeId) || threads[0] || null;

  async function send(close = false) {
    if (!active || !reply.trim()) return;
    setLoading(true);
    await fetch("/api/admin/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: active.id, message: reply.trim(), close }),
    });
    setReply("");
    setLoading(false);
    await load();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-4">
        <BackLink href="/admin/content" label="Content queue" />
      </div>
      <h1 className="type-page-title">Inquiry inbox</h1>
      <p className="mt-2 text-muted">Landing-page and student questions. WhatsApp is not wired yet — reply here.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-[16rem_1fr]">
        <div className="card-static overflow-hidden">
          {threads.length === 0 && <p className="p-4 text-sm text-muted">No inquiries yet.</p>}
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={`block w-full border-b border-line px-4 py-3 text-left text-sm ${
                active?.id === t.id ? "bg-paper" : "bg-white"
              }`}
            >
              <p className="font-semibold">{t.name}</p>
              <p className="truncate text-xs text-muted">{t.preview || "No messages"}</p>
              <p className="mt-1 font-mono-brand text-[10px] uppercase tracking-wide text-golddeep">{t.status}</p>
            </button>
          ))}
        </div>

        {active ? (
          <div className="card-static flex min-h-[28rem] flex-col">
            <div className="border-b border-line px-5 py-3">
              <p className="font-semibold">{active.name}</p>
              <p className="text-xs text-muted">
                {active.email || "No email"} · {active.signedIn ? "signed in" : "visitor"}
              </p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {active.messages.map((m) => (
                <div key={m.id} className={m.sender === "admin" ? "text-right" : "text-left"}>
                  <p className="font-mono-brand text-[10px] uppercase text-muted">{m.sender}</p>
                  <p className="mt-0.5 inline-block max-w-[85%] rounded-2xl bg-paper px-3 py-2 text-sm">{m.content}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-line p-4">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-line px-3 py-2 text-sm"
                placeholder="Reply as Ubora…"
              />
              <div className="mt-3 flex gap-2">
                <button onClick={() => send(false)} disabled={loading || !reply.trim()} className="btn-gold btn-sm disabled:opacity-40">
                  Send reply
                </button>
                <button onClick={() => send(true)} disabled={loading || !reply.trim()} className="btn-ghost btn-sm disabled:opacity-40">
                  Reply and close
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-static p-8 text-sm text-muted">Pick a thread.</div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Msg = { id?: string; sender: "visitor" | "admin"; content: string; createdAt?: string };

export default function InquiryChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hide = pathname?.startsWith("/admin");

  useEffect(() => {
    if (hide) return;
    let cancelled = false;
    fetch("/api/inquiry")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.messages) setMessages(data.messages);
        if (data.thread?.name) setName(data.thread.name);
        if (data.thread?.email) setEmail(data.thread.email);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [hide]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, loading]);

  if (hide) return null;

  async function send() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setError(null);
    setInput("");
    setMessages((prev) => [...prev, { sender: "visitor", content: trimmed }]);
    setLoading(true);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not send. Try again.");
        setMessages((prev) => prev.slice(0, -1));
        return;
      }
      if (data.messages) setMessages(data.messages);
    } catch {
      setError("Could not send. Check your connection.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="card-static flex h-[460px] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden shadow-cardHover">
          <div className="bg-ink px-4 py-3 text-white">
            <p className="font-display text-base font-semibold">Ask Ubora</p>
            <p className="mt-0.5 text-xs text-white/65">Inquiries only. WhatsApp comes later. We reply here.</p>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-paper px-4 py-3">
            {loaded && messages.length === 0 && (
              <p className="type-body text-muted">
                Fees, registration, TMAs, CBT, or a stuck login? Leave a name and your question. An admin reads this inbox.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={m.id || i} className={m.sender === "visitor" ? "text-right" : "text-left"}>
                <p className="font-mono-brand text-[10px] uppercase tracking-wide text-muted">
                  {m.sender === "visitor" ? "You" : "Ubora"}
                </p>
                <p className={`mt-0.5 inline-block max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.sender === "visitor" ? "bg-ink text-white" : "bg-white border border-line"
                }`}>
                  {m.content}
                </p>
              </div>
            ))}
            {loading && <p className="text-xs text-muted">Sending…</p>}
          </div>
          {error && <p className="border-t border-line px-4 py-2 text-xs text-coral">{error}</p>}
          <div className="border-t border-line bg-white p-3">
            {messages.length === 0 && (
              <div className="mb-2 grid grid-cols-2 gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  className="rounded-lg border border-line px-2.5 py-1.5 text-xs"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional)"
                  className="rounded-lg border border-line px-2.5 py-1.5 text-xs"
                />
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="Type your question…"
                className="flex-1 resize-none rounded-lg border border-line px-2.5 py-2 text-sm"
              />
              <button onClick={send} disabled={loading || !input.trim()} className="btn-gold btn-sm disabled:opacity-40">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-gold shadow-cardHover"
        aria-expanded={open}
      >
        {open ? "Close chat" : "Ask a question"}
      </button>
    </div>
  );
}

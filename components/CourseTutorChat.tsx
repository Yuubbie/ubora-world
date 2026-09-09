// components/CourseTutorChat.tsx
//
// Drop this component into any course detail page:
//
//   <CourseTutorChat courseId={course.id} courseTitle={course.title} />
//
// It handles its own message history (loaded from GET /api/tutor/chat
// on mount) and sends new messages to POST /api/tutor/chat. No other
// props needed — subscription gating is enforced server-side by the
// API route itself, so an unauthorized user will simply see the
// "Subscription required" state below rather than any real content.

"use client";

import { useState, useEffect, useRef } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
};

export default function CourseTutorChat({
  courseId,
  courseTitle: courseTitleProp,
}: {
  courseId: string;
  courseTitle?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [courseTitle, setCourseTitle] = useState(courseTitleProp ?? "");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/tutor/chat?courseId=${courseId}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.messages) setMessages(data.messages);
        if (!courseTitleProp && data.course) {
          setCourseTitle(`${data.course.code}: ${data.course.title}`);
        }
        setHistoryLoaded(true);
      })
      .catch(() => setHistoryLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [courseId, courseTitleProp]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setError(null);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setLoading(true);

    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, message: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Couldn't reach the tutor. Check your connection and try again.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-[560px] max-h-[80vh] w-full bg-[#FAF8F4] border border-[#1F2937]/15">
      {/* Header */}
      <div className="shrink-0 px-5 py-4 bg-[#1F2937] text-[#FAF8F4]">
        <div className="text-[15px] font-medium leading-tight">Course Tutor</div>
        {courseTitle && (
          <div className="text-[13px] text-[#FAF8F4]/70 leading-tight mt-0.5">{courseTitle}</div>
        )}
      </div>

      {/* Message history */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
        {!historyLoaded && (
          <p className="text-[14px] text-[#1F2937]/50">Loading your conversation…</p>
        )}

        {historyLoaded && messages.length === 0 && (
          <div className="text-[14px] text-[#1F2937]/70 leading-relaxed max-w-[36ch]">
            Ask about anything covered in {courseTitle || "this course"}. Start with a topic
            you found confusing, or ask for a walk-through of a concept
            before your CBT.
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[75%] text-right">
                <div className="text-[10px] tracking-wide text-[#1F2937]/45 mb-1">You</div>
                <div className="text-[14px] text-[#1F2937] leading-relaxed border-r-2 border-[#1F2937]/25 pr-3">
                  {m.content}
                </div>
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-start">
              <div className="max-w-[85%]">
                <div className="text-[10px] tracking-wide text-[#A6802E] mb-1">Tutor</div>
                <div className="text-[14px] text-[#1F2937] leading-relaxed border-l-2 border-[#A6802E] pl-3">
                  {m.content}
                </div>
              </div>
            </div>
          )
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="text-[10px] tracking-wide text-[#A6802E] mb-1">Tutor</div>
              <div className="text-[14px] text-[#1F2937]/50 leading-relaxed border-l-2 border-[#A6802E]/40 pl-3">
                Thinking…
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="shrink-0 px-5 py-2 text-[13px] text-[#8B3A2B] bg-[#8B3A2B]/8 border-t border-[#8B3A2B]/15">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 border-t border-[#1F2937]/15 p-3 flex items-end gap-2 bg-[#FAF8F4]">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about this course…"
          rows={1}
          disabled={loading}
          className="flex-1 resize-none bg-transparent text-[14px] text-[#1F2937] placeholder:text-[#1F2937]/40 outline-none px-2 py-2 max-h-24"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="shrink-0 px-4 py-2 text-[13px] font-medium text-[#FAF8F4] bg-[#1F2937] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

type Question = { id: string; text: string; options: string[]; optionOrder: number[] };
type Result = { score: number; total: number; percentage: number; grade: string };

const QUIZ_SECONDS = 300;

export default function CbtQuizPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; selectedDisplayIndex: number; optionOrder: number[] }[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(QUIZ_SECONDS);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch(`/api/cbt/${courseId}/questions`)
      .then(async (r) => {
        if (!r.ok) {
          const d = await r.json();
          throw new Error(d.error ?? "Could not load questions");
        }
        return r.json();
      })
      .then((d) => setQuestions(d.questions))
      .catch((e) => setError(e.message));
  }, [courseId]);

  useEffect(() => {
    if (!questions || result) return;
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          submit(answers);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line
  }, [questions, result]);

  async function submit(finalAnswers: typeof answers) {
    const res = await fetch("/api/cbt/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, answers: finalAnswers }),
    });
    const data = await res.json();
    setResult(data);
  }

  function next() {
    if (!questions) return;
    const q = questions[idx];
    const updated = [...answers, { questionId: q.id, selectedDisplayIndex: selected!, optionOrder: q.optionOrder }];
    setAnswers(updated);
    setSelected(null);
    if (idx + 1 < questions.length) setIdx(idx + 1);
    else submit(updated);
  }

  if (error) return <div className="p-8 text-coral">{error}</div>;
  if (!questions) return <div className="p-8 text-muted">Loading...</div>;

  if (result) {
    const gradeColor = result.grade === "Distinction" ? "#2E7D5B" : result.grade === "Pass" ? "#8C6D1F" : "#B23A2E";
    const serial = "UW-" + Math.floor(100000 + Math.random() * 899999);
    return (
      <div className="max-w-lg mx-auto p-8">
        <h1 className="font-display text-2xl font-semibold mb-6 text-center">Practice complete</h1>
        <div className="bg-white border border-line rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-ink text-white px-6 py-5 flex items-center justify-between">
            <span className="font-display font-semibold text-sm">Ubora World - CBT Result Slip</span>
            <span className="font-mono-brand text-xs opacity-60">{serial}</span>
          </div>
          <div className="p-6">
            <p className="font-mono-brand text-xs text-muted mb-1">CSC 103</p>
            <div className="flex items-end gap-2 mb-4">
              <span className="font-display text-6xl font-semibold">{result.percentage}%</span>
              <span className="text-sm text-muted mb-2">({result.score}/{result.total} correct)</span>
            </div>
            <span className="font-mono-brand text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "#F3F5F4", color: gradeColor }}>
              {result.grade}
            </span>
            <div className="slip-perforate h-4 mt-6 -mx-6" />
            <p className="font-mono-brand text-xs text-muted mt-4 text-center">
              Practice attempt - not an official result - {new Date().toLocaleDateString("en-GB")}
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-center">
          <a href="/cbt" className="bg-ink text-white rounded-lg px-5 py-2.5 text-sm font-semibold">Practice another course</a>
          <a href="/dashboard" className="border border-line rounded-lg px-5 py-2.5 text-sm font-medium">Dashboard</a>
        </div>
      </div>
    );
  }

  const q = questions[idx];
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="max-w-xl mx-auto p-8">
      <div className="flex justify-between items-center mb-5">
        <span className="font-mono-brand text-xs text-muted">Question {idx + 1} of {questions.length}</span>
        <span className="font-mono-brand text-sm px-3 py-1.5 rounded-full" style={{ background: seconds < 30 ? "#F6E3E0" : "#F3F5F4", color: seconds < 30 ? "#B23A2E" : "#16233F" }}>
          {mm}:{ss}
        </span>
      </div>

      <div className="flex gap-1.5 mb-6">
        {questions.map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i <= idx ? "#16233F" : "#DCE1E6" }} />
        ))}
      </div>

      <div className="bg-white border border-line rounded-2xl p-6 mb-5 shadow-sm">
        <h2 className="font-display text-xl font-semibold mb-5">{q.text}</h2>
        <div className="flex flex-col gap-2.5">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                selected === i ? "bg-ink text-white border-ink" : "border-line hover:border-ink2"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={next}
        disabled={selected === null}
        className="bg-ink text-white rounded-lg px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
      >
        {idx + 1 === questions.length ? "Submit" : "Next question"}
      </button>
    </div>
  );
}
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type SetInfo = { module: number; set: number; count: number };
type Question = { id: string; text: string; options: string[]; optionOrder: number[] };
type ReviewItem = {
  questionId: string;
  text: string;
  options: string[];
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string | null;
};
type Result = { score: number; total: number; percentage: number; grade: string; review: ReviewItem[] };

const SECONDS_PER_QUESTION = 60;
const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

const MODULE_TITLES: Record<number, string> = {
  0: "Unsorted Questions",
  1: "Module 1",
  2: "Module 2",
  3: "Module 3",
  4: "Module 4",
};

function moduleTitle(m: number) {
  return MODULE_TITLES[m] ?? `Module ${m}`;
}

// One accent per module, like colored tabs on folders in a course binder.
// Reuses the same hues already used for grade colors on the results screen
// (gold, ink, green) plus one warm sienna, so the palette feels like one
// deliberate family rather than an arbitrary rainbow.
const MODULE_ACCENTS: Record<number, string> = {
  0: "#8C6D1F",
  1: "#C79A3D",
  2: "#16233F",
  3: "#2E7D5B",
  4: "#8C5A3B",
};

const ERROR_MESSAGES: Record<string, string> = {
  unauthenticated: "You need to be logged in to start a practice test.",
  no_approved_question_bank: "This course doesn't have an approved question bank yet — check back soon.",
  no_questions_in_module: "This practice set doesn't have any questions yet — check back soon.",
};

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function CbtQuizPage() {
  const { courseId } = useParams<{ courseId: string }>();

  // Step 1: pick a practice set
  const [sets, setSets] = useState<SetInfo[] | null>(null);
  const [selected, setSelected] = useState<{ module: number; set: number } | null>(null);
  const [setListError, setSetListError] = useState<string | null>(null);

  // Score reveal animation — counts up from 0 to the real percentage,
  // then reveals the grade badge, so the result feels like it's landing
  // rather than just appearing.
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [showGrade, setShowGrade] = useState(false);

  // Step 2: the actual quiz, once a set has been chosen
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { selectedDisplayIndex: number; optionOrder: number[] }>>({});
  const [seconds, setSeconds] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    fetch(`/api/cbt/${courseId}/modules`)
      .then(async (r) => {
        if (!r.ok) {
          const d = await r.json();
          throw new Error(d.error ?? "Could not load practice sets");
        }
        return r.json();
      })
      .then((d: { sets: SetInfo[] }) => setSets(d.sets))
      .catch((e) => setSetListError(e.message));
  }, [courseId]);

  useEffect(() => {
    if (!selected) return;
    fetch(`/api/cbt/${courseId}/questions?module=${selected.module}&set=${selected.set}`)
      .then(async (r) => {
        if (!r.ok) {
          const d = await r.json();
          throw new Error(d.error ?? "Could not load questions");
        }
        return r.json();
      })
      .then((d: { questions: Question[] }) => {
        setQuestions(d.questions);
        setSeconds(d.questions.length * SECONDS_PER_QUESTION);
      })
      .catch((e) => setQuizError(e.message));
  }, [selected, courseId]);

  useEffect(() => {
    if (!questions || result || seconds === null) return;
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s === null) return s;
        if (s <= 1) {
          clearInterval(timerRef.current!);
          submit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line
  }, [questions, result, seconds === null]);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  // Animate the score counting up from 0 to the real percentage whenever a
  // new result comes in, then reveal the grade badge shortly after.
  useEffect(() => {
    if (!result) {
      setAnimatedPercentage(0);
      setShowGrade(false);
      return;
    }
    const target = result.percentage;
    const durationMs = 1100;
    const start = performance.now();

    let frame: number;
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      // ease-out cubic, so it starts fast and settles gently rather than
      // ticking up at a flat, mechanical rate
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedPercentage(Math.round(eased * target));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setShowGrade(true);
      }
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [result]);

  async function submit() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    const payload = Object.entries(answers).map(([questionId, a]) => ({
      questionId,
      selectedDisplayIndex: a.selectedDisplayIndex,
      optionOrder: a.optionOrder,
    }));

    const sessionQuestionIds = (questions ?? []).map((q) => q.id);

    const res = await fetch("/api/cbt/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, module: selected?.module ?? null, sessionQuestionIds, answers: payload }),
    });
    const data = await res.json();
    setResult(data);
  }

  function handleSubmitClick() {
    if (!questions) return;
    const unanswered = questions.length - answeredCount;
    if (unanswered > 0) {
      const proceed = window.confirm(
        `You still have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"}. Submit anyway?`
      );
      if (!proceed) return;
    }
    submit();
  }

  function selectOption(question: Question, optionIndex: number) {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: { selectedDisplayIndex: optionIndex, optionOrder: question.optionOrder },
    }));
  }

  function backToSetPicker() {
    setSelected(null);
    setQuestions(null);
    setAnswers({});
    setIdx(0);
    setSeconds(null);
    setResult(null);
    setQuizError(null);
    submittingRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
  }

  // --- Set picker screen ---
  if (!selected) {
    if (setListError) {
      const isPlanIssue = setListError !== "unauthenticated" && setListError !== "no_approved_question_bank";
      const message = ERROR_MESSAGES[setListError] ?? (isPlanIssue ? setListError : "Something went wrong loading this course.");
      return (
        <div className="max-w-md mx-auto p-8 pt-20 text-center">
          <div className="card-premium p-7">
            <p className="font-display text-lg font-semibold mb-2">Can't load this course yet</p>
            <p className="text-sm text-muted mb-6">{message}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              {isPlanIssue && <a href="/subscribe" className="btn-gold text-sm py-2.5 px-5">Upgrade plan</a>}
              <a href="/cbt" className="border border-line rounded-lg px-5 py-2.5 text-sm font-medium">Back to CBT Practice</a>
            </div>
          </div>
        </div>
      );
    }
    if (!sets) return <div className="p-8 text-muted">Loading...</div>;

    // Group sets by module for display, so each module gets its own header.
    const byModule = new Map<number, SetInfo[]>();
    for (const s of sets) {
      if (!byModule.has(s.module)) byModule.set(s.module, []);
      byModule.get(s.module)!.push(s);
    }

    const totalSets = sets.length;
    const totalQuestions = sets.reduce((sum, s) => sum + s.count, 0);
    const totalModules = byModule.size;

    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="mb-9">
          <p className="font-mono-brand text-[11px] tracking-[0.2em] text-muted uppercase mb-3">CSS121 · Introduction to Psychology</p>
          <h1 className="font-display text-3xl font-bold mb-2">Choose a practice set</h1>
          <p className="text-sm text-muted max-w-md leading-relaxed">
            Each set is a focused, 30-question session. Work your way through every set in a module to cover all its questions — nothing repeats until you've seen everything.
          </p>
          <Link
            href={`/tutor/${courseId}`}
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-[#16233F] underline underline-offset-4 hover:text-[#2E7D5B] transition-colors"
          >
            Ask the Tutor
            <span aria-hidden="true">→</span>
          </Link>
          <div className="flex items-center gap-3 mt-5 font-mono-brand text-[11px] text-muted">
            <span>{totalModules} modules</span>
            <span className="w-1 h-1 rounded-full bg-[#DCE1E6]" />
            <span>{totalSets} sets</span>
            <span className="w-1 h-1 rounded-full bg-[#DCE1E6]" />
            <span>{totalQuestions} questions</span>
          </div>
        </div>

        <div className="flex flex-col gap-10">
          {Array.from(byModule.entries()).map(([moduleNum, moduleSets]) => {
            const accent = MODULE_ACCENTS[moduleNum] ?? MODULE_ACCENTS[0];
            return (
              <div key={moduleNum}>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="font-mono-brand text-[10px] font-bold tracking-[0.22em] uppercase rounded-full px-3 py-1 border"
                    style={{ color: accent, borderColor: accent, background: `${accent}14` }}
                  >
                    {moduleTitle(moduleNum)}
                  </span>
                  <div className="h-px flex-1" style={{ background: "#E4E1D8" }} />
                </div>

                <div className="flex flex-col gap-3">
                  {moduleSets.map((s) => (
                    <button
                      key={`${s.module}-${s.set}`}
                      onClick={() => setSelected({ module: s.module, set: s.set })}
                      className="group relative text-left bg-white border border-line rounded-2xl pl-7 pr-5 py-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex items-center gap-4 overflow-hidden"
                      style={{ borderColor: "#E4E1D8" }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = accent)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E4E1D8")}
                    >
                      {/* spine accent, like a tabbed folder edge */}
                      <span className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: accent }} />

                      {/* seal-style set number */}
                      <span
                        className="shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center font-display text-xl font-bold transition-colors"
                        style={{ borderColor: "#16233F", color: "#16233F" }}
                      >
                        {s.set}
                      </span>

                      <div className="flex-1">
                        <p className="font-display text-xl font-bold">Set {s.set}</p>
                        <p className="font-mono-brand text-xs text-muted mt-0.5">
                          {s.count} question{s.count === 1 ? "" : "s"} · about {Math.round((s.count * SECONDS_PER_QUESTION) / 60)} min
                        </p>
                      </div>

                      <span
                        className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-display text-lg transition-colors"
                        style={{ background: "#F3F5F4", color: "#16233F" }}
                      >
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- Quiz error screen ---
  if (quizError) {
    const isPlanIssue = quizError !== "unauthenticated" && quizError !== "no_approved_question_bank" && quizError !== "no_questions_in_module";
    const message = ERROR_MESSAGES[quizError] ?? (isPlanIssue ? quizError : "Something went wrong loading this practice test.");
    return (
      <div className="max-w-md mx-auto p-8 pt-20 text-center">
        <div className="card-premium p-7">
          <p className="font-display text-lg font-semibold mb-2">Can't start this practice test</p>
          <p className="text-sm text-muted mb-6">{message}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            {isPlanIssue && <a href="/subscribe" className="btn-gold text-sm py-2.5 px-5">Upgrade plan</a>}
            <button onClick={backToSetPicker} className="border border-line rounded-lg px-5 py-2.5 text-sm font-medium">
              Choose a different set
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (!questions || seconds === null) return <div className="p-8 text-muted">Loading...</div>;

  // --- Results screen ---
  if (result) {
    const gradeColor = result.grade === "Distinction" ? "#2E7D5B" : result.grade === "Pass" ? "#8C6D1F" : "#B23A2E";
    const serial = "UW-" + Math.floor(100000 + Math.random() * 899999);
    return (
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="font-display text-2xl font-semibold mb-1 text-center">Practice complete</h1>
        <p className="text-sm text-muted text-center mb-6">{moduleTitle(selected.module)} · Set {selected.set}</p>
        <div className="bg-white border border-line rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-ink text-white px-6 py-5 flex items-center justify-between">
            <span className="font-display font-semibold text-sm">Ubora World - CBT Result Slip</span>
            <span className="font-mono-brand text-xs opacity-60">{serial}</span>
          </div>
          <div className="p-6">
            <div className="flex items-end gap-2 mb-4">
              <span className="font-display text-6xl font-bold tabular-nums">{animatedPercentage}%</span>
              <span className="text-sm text-muted mb-2">({result.score}/{result.total} correct)</span>
            </div>
            <span
              className="font-mono-brand text-xs font-semibold px-3 py-1.5 rounded-full inline-block transition-all duration-500"
              style={{
                background: "#F3F5F4",
                color: gradeColor,
                opacity: showGrade ? 1 : 0,
                transform: showGrade ? "scale(1)" : "scale(0.85)",
              }}
            >
              {result.grade}
            </span>
            <div className="slip-perforate h-4 mt-6 -mx-6" />
            <p className="font-mono-brand text-xs text-muted mt-4 text-center">
              Practice attempt - not an official result - {new Date().toLocaleDateString("en-GB")}
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-center">
          <button onClick={backToSetPicker} className="bg-ink text-white rounded-lg px-5 py-2.5 text-sm font-semibold">
            Choose another set
          </button>
          <a href="/dashboard" className="border border-line rounded-lg px-5 py-2.5 text-sm font-medium">Dashboard</a>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold mb-4">Review your answers</h2>
          <div className="flex flex-col gap-4">
            {result.review.map((r, i) => {
              const yourLetter = r.selectedIndex >= 0 ? OPTION_LETTERS[r.selectedIndex] : null;
              const correctLetter = OPTION_LETTERS[r.correctIndex];
              return (
                <div key={r.questionId} className="bg-white border border-line rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="font-display text-base font-bold">{i + 1}. {r.text}</p>
                    <span
                      className="shrink-0 font-mono-brand text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: r.isCorrect ? "#E7F3EC" : "#F6E3E0", color: r.isCorrect ? "#2E7D5B" : "#B23A2E" }}
                    >
                      {r.selectedIndex < 0 ? "Not answered" : r.isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 mb-3">
                    {r.options.map((opt, oi) => {
                      const isYourPick = oi === r.selectedIndex;
                      const isCorrectAnswer = oi === r.correctIndex;
                      let style: React.CSSProperties = { borderColor: "#DCE1E6" };
                      if (isCorrectAnswer) style = { background: "#E7F3EC", borderColor: "#2E7D5B" };
                      else if (isYourPick && !isCorrectAnswer) style = { background: "#F6E3E0", borderColor: "#B23A2E" };
                      return (
                        <div key={oi} className="text-left px-4 py-2.5 rounded-lg border text-sm font-medium" style={style}>
                          <span className="font-mono-brand text-xs opacity-60 mr-2">{OPTION_LETTERS[oi]}.</span>
                          {opt}
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-[#F3F5F4] rounded-lg px-4 py-3 text-sm text-muted">
                    {yourLetter && !r.isCorrect && (
                      <p className="mb-1">
                        <span className="font-semibold" style={{ color: "#B23A2E" }}>Your answer: Option {yourLetter}</span>
                        {" — "}{r.options[r.selectedIndex]} <span className="opacity-70">(Incorrect)</span>
                      </p>
                    )}
                    {r.selectedIndex < 0 && (
                      <p className="mb-1">
                        <span className="font-semibold" style={{ color: "#B23A2E" }}>You did not answer this question.</span>
                      </p>
                    )}
                    <p className="mb-1">
                      <span className="font-semibold" style={{ color: "#2E7D5B" }}>Correct answer: Option {correctLetter}</span>
                      {" — "}{r.options[r.correctIndex]}
                    </p>
                    {r.explanation && (
                      <p><span className="font-semibold text-ink">Why: </span>{r.explanation}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- Active quiz screen ---
  const q = questions[idx];
  const currentAnswer = answers[q.id];

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex justify-between items-center mb-2">
        <p className="font-mono-brand text-xs text-muted">{moduleTitle(selected.module)} · Set {selected.set}</p>
        <button onClick={backToSetPicker} className="font-mono-brand text-xs text-muted underline">
          Choose a different set
        </button>
      </div>
      <div className="flex justify-between items-center mb-5">
        <span className="font-mono-brand text-xs text-muted">{answeredCount} of {questions.length} answered</span>
        <span
          className={`font-mono-brand text-sm px-3 py-1.5 rounded-full ${seconds < 60 ? "animate-pulse" : ""}`}
          style={{ background: seconds < 60 ? "#F6E3E0" : "#F3F5F4", color: seconds < 60 ? "#B23A2E" : "#16233F" }}
        >
          {formatTime(seconds)}
        </span>
      </div>

      <div className="bg-white border border-line rounded-2xl p-4 mb-5 shadow-sm">
        <p className="font-mono-brand text-xs text-muted mb-3">Jump to any question — skip and come back anytime</p>
        <div className="flex flex-wrap gap-2">
          {questions.map((qq, i) => {
            const isAnswered = !!answers[qq.id];
            const isCurrent = i === idx;
            let style: React.CSSProperties = { borderColor: "#DCE1E6", background: "white", color: "#16233F" };
            if (isAnswered) style = { borderColor: "#16233F", background: "#16233F", color: "white" };
            if (isCurrent) style = { borderColor: "#C79A3D", background: "#F6EAD0", color: "#16233F", boxShadow: "0 0 0 2px #C79A3D" };
            return (
              <button key={qq.id} onClick={() => setIdx(i)} className="w-9 h-9 rounded-lg border text-xs font-semibold font-mono-brand" style={style}>
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes qFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div key={q.id} className="bg-white border border-line rounded-2xl p-6 mb-5 shadow-sm" style={{ animation: "qFadeIn 0.28s ease-out" }}>
        <p className="font-mono-brand text-xs text-muted mb-2">Question {idx + 1} of {questions.length}</p>
        <h2 className="font-display text-2xl font-bold mb-5">{q.text}</h2>
        <div className="flex flex-col gap-2.5">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => selectOption(q, i)}
              className={`text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all active:scale-[0.98] ${
                currentAnswer?.selectedDisplayIndex === i ? "bg-ink text-white border-ink" : "border-line hover:border-ink2"
              }`}
            >
              <span className="font-mono-brand text-xs opacity-60 mr-2">{OPTION_LETTERS[i]}.</span>
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2">
          <button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0} className="border border-line rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-40">
            Previous
          </button>
          <button onClick={() => setIdx((i) => Math.min(questions.length - 1, i + 1))} disabled={idx === questions.length - 1} className="border border-line rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-40">
            Next
          </button>
        </div>
        <button onClick={handleSubmitClick} className="bg-ink text-white rounded-lg px-5 py-2.5 text-sm font-semibold">
          Submit Test
        </button>
      </div>
    </div>
  );
}
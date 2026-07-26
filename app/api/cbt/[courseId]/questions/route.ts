import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireTier } from "@/lib/access";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Must match SET_SIZE in the modules route, so "Set 2" always means the
// same 30 questions regardless of which endpoint is asked.
const SET_SIZE = 30;

export async function GET(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const gate = await requireTier((session.user as any).id, "standard");
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 403 });

  const url = new URL(req.url);
  const moduleParam = url.searchParams.get("module");
  const setParam = url.searchParams.get("set");
  const moduleFilter = moduleParam !== null ? parseInt(moduleParam, 10) : null;
  const setNumber = setParam !== null ? parseInt(setParam, 10) : 1;

  // Spec 6.6: only an approved question bank is ever served to a student.
  const bank = await db.questionBank.findFirst({
    where: { courseId: courseId, status: "approved" },
    include: { questions: true },
  });

  if (!bank) return NextResponse.json({ error: "no_approved_question_bank" }, { status: 404 });

  let poolQuestions = bank.questions;
  if (moduleFilter !== null && !Number.isNaN(moduleFilter)) {
    poolQuestions = poolQuestions.filter((q) => (q.module ?? 0) === moduleFilter);
  }

  if (poolQuestions.length === 0) {
    return NextResponse.json({ error: "no_questions_in_module" }, { status: 404 });
  }

  // Deterministic ordering (same sort every time) so "Set N" always refers
  // to the exact same slice of questions — this is what guarantees full
  // coverage across sets, rather than random sampling that could miss some.
  const sortedPool = [...poolQuestions].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const start = (setNumber - 1) * SET_SIZE;
  const end = Math.min(start + SET_SIZE, sortedPool.length);
  const setQuestions = sortedPool.slice(start, end);

  if (setQuestions.length === 0) {
    return NextResponse.json({ error: "no_questions_in_module" }, { status: 404 });
  }

  // Within the fixed set, question order AND option order are still
  // randomized per attempt — only WHICH questions belong to this set is
  // fixed, not the order they're presented in.
  // correctOptionIndex is stripped — the client must never receive answers.
  const questions = shuffle(setQuestions).map((q) => {
    const optionOrder = shuffle(q.options.map((_, i) => i));
    return {
      id: q.id,
      text: q.text,
      options: optionOrder.map((i) => q.options[i]),
      optionOrder,
    };
  });

  return NextResponse.json({ questionBankId: bank.id, questions });
}

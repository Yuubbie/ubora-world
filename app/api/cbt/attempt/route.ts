import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireTier } from "@/lib/access";
import { gradeFor } from "@/lib/config";

const SET_SIZE = 30;

const answerSchema = z.object({
  questionId: z.string(),
  selectedText: z.string().min(1).max(2000),
});

const attemptSchema = z.object({
  courseId: z.string(),
  module: z.number().int().nullable().optional(),
  set: z.number().int().positive().optional(),
  answers: z.array(answerSchema).max(200),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const gate = await requireTier((session.user as any).id, "standard");
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 403 });

  const parsed = attemptSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { courseId, module, set: setNumber, answers } = parsed.data;

  const bank = await db.questionBank.findFirst({
    where: { courseId, status: "approved" },
    include: { questions: true },
  });
  if (!bank) return NextResponse.json({ error: "no_approved_question_bank" }, { status: 404 });

  let poolQuestions = bank.questions;
  if (module !== null && module !== undefined && !Number.isNaN(module)) {
    poolQuestions = poolQuestions.filter((q) => (q.module ?? 0) === module);
  }
  const sortedPool = [...poolQuestions].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const useSet = setNumber && setNumber > 0 ? setNumber : 1;
  const start = (useSet - 1) * SET_SIZE;
  const scopedQuestions = sortedPool.slice(start, start + SET_SIZE);

  if (scopedQuestions.length === 0) {
    return NextResponse.json({ error: "invalid_session" }, { status: 400 });
  }

  const scopedIds = new Set(scopedQuestions.map((q) => q.id));
  const answerByQuestionId = new Map(
    answers.filter((a) => scopedIds.has(a.questionId)).map((a) => [a.questionId, a])
  );

  let correct = 0;
  const review: {
    questionId: string;
    text: string;
    options: string[];
    selectedIndex: number; // -1 means the student never answered this one
    correctIndex: number;
    isCorrect: boolean;
    explanation: string | null;
  }[] = [];

  for (const q of scopedQuestions) {
    const a = answerByQuestionId.get(q.id);

    if (!a) {
      review.push({
        questionId: q.id,
        text: q.text,
        options: q.options,
        selectedIndex: -1,
        correctIndex: q.correctOptionIndex,
        isCorrect: false,
        explanation: q.explanation ?? null,
      });
      continue;
    }

    const originalSelectedIndex = q.options.findIndex((opt) => opt === a.selectedText);
    const isCorrect = originalSelectedIndex === q.correctOptionIndex;
    if (isCorrect) correct += 1;

    review.push({
      questionId: q.id,
      text: q.text,
      options: q.options,
      selectedIndex: originalSelectedIndex,
      correctIndex: q.correctOptionIndex,
      isCorrect,
      explanation: q.explanation ?? null,
    });
  }

  // Scored against exactly the session that was shown — this session's own
  // question count, not the whole module or course pool.
  const total = scopedQuestions.length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Spec 6.3 rule 2: attempts are immutable and scored authoritatively server-side.
  const attempt = await db.attempt.create({
    data: {
      userId: (session.user as any).id,
      courseId,
      score: correct,
      total,
      completedAt: new Date(),
    },
  });

  return NextResponse.json({
    attemptId: attempt.id,
    score: correct,
    total,
    percentage,
    grade: gradeFor(percentage),
    review,
  });
}

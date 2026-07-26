import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireTier } from "@/lib/access";
import { gradeFor } from "@/lib/config";

const answerSchema = z.object({
  questionId: z.string(),
  selectedDisplayIndex: z.number().int(),
  optionOrder: z.array(z.number().int()), // returned by the questions endpoint, echoed back here
});

const attemptSchema = z.object({
  courseId: z.string(),
  module: z.number().int().nullable().optional(), // which module was practiced, if any (for records only now)
  // Every question ID that was actually shown in this session (answered or
  // skipped), as returned by the /questions endpoint. This is what scoring
  // is based on — not the whole module — since sessions are randomly
  // sampled down to a cap and can differ attempt to attempt.
  sessionQuestionIds: z.array(z.string()),
  answers: z.array(answerSchema),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const gate = await requireTier((session.user as any).id, "standard");
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 403 });

  const parsed = attemptSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { courseId, sessionQuestionIds, answers } = parsed.data;

  // Re-derive the *legitimate* question set server-side — the same approved
  // bank the /questions endpoint would have served for this course. We never
  // trust that questionIds in the request actually came from there.
  const bank = await db.questionBank.findFirst({
    where: { courseId, status: "approved" },
    include: { questions: true },
  });
  if (!bank) return NextResponse.json({ error: "no_approved_question_bank" }, { status: 404 });

  const bankQuestionsById = new Map(bank.questions.map((q) => [q.id, q]));

  // Only IDs that genuinely belong to this course's approved bank are
  // trusted as "part of this session" — anything forged or stale is dropped.
  const scopedQuestions = sessionQuestionIds
    .filter((id) => bankQuestionsById.has(id))
    .map((id) => bankQuestionsById.get(id)!);

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

    const originalSelectedIndex = a.optionOrder[a.selectedDisplayIndex];
    const isCorrect = originalSelectedIndex === q.correctOptionIndex;
    if (isCorrect) correct += 1;

    const displayOptions = a.optionOrder.map((originalIdx) => q.options[originalIdx]);
    const correctDisplayIndex = a.optionOrder.indexOf(q.correctOptionIndex);

    review.push({
      questionId: q.id,
      text: q.text,
      options: displayOptions,
      selectedIndex: a.selectedDisplayIndex,
      correctIndex: correctDisplayIndex,
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

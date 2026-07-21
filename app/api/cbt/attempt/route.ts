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
  answers: z.array(answerSchema),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const gate = await requireTier((session.user as any).id, "standard");
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 403 });

  const parsed = attemptSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { courseId, answers } = parsed.data;

  // Re-derive the *legitimate* question set server-side — the same approved
  // bank the /questions endpoint would have served for this course. We never
  // trust that the questionIds in the request actually came from there.
  const bank = await db.questionBank.findFirst({
    where: { courseId, status: "approved" },
    include: { questions: true },
  });
  if (!bank) return NextResponse.json({ error: "no_approved_question_bank" }, { status: 404 });

  const validQuestionIds = new Set(bank.questions.map((q) => q.id));
  const byId = new Map(bank.questions.map((q) => [q.id, q]));

  // Only answers whose questionId actually belongs to this course's approved
  // bank are scored or counted — anything else submitted is silently ignored,
  // not trusted, and not allowed to inflate or deflate the total.
  const validAnswers = answers.filter((a) => validQuestionIds.has(a.questionId));

  let correct = 0;
  for (const a of validAnswers) {
    const q = byId.get(a.questionId)!;
    const originalSelectedIndex = a.optionOrder[a.selectedDisplayIndex];
    if (originalSelectedIndex === q.correctOptionIndex) correct += 1;
  }

  const total = validAnswers.length;
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
  });
}

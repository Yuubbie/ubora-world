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

  const questionIds = answers.map((a) => a.questionId);
  const questions = await db.question.findMany({ where: { id: { in: questionIds } } });
  const byId = new Map(questions.map((q) => [q.id, q]));

  // Spec 6.3 rule 2: attempts are immutable and scored authoritatively server-side.
  let correct = 0;
  for (const a of answers) {
    const q = byId.get(a.questionId);
    if (!q) continue;
    const originalSelectedIndex = a.optionOrder[a.selectedDisplayIndex];
    if (originalSelectedIndex === q.correctOptionIndex) correct += 1;
  }

  const total = answers.length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

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

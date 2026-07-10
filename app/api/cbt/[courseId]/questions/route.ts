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

export async function GET(_req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const gate = await requireTier((session.user as any).id, "standard");
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 403 });

  // Spec 6.6: only an approved question bank is ever served to a student.
  const bank = await db.questionBank.findFirst({
    where: { courseId: courseId, status: "approved" },
    include: { questions: true },
  });

  if (!bank) return NextResponse.json({ error: "no_approved_question_bank" }, { status: 404 });

  // Spec 4.2: question AND option order randomized per attempt.
  // correctOptionIndex is stripped — the client must never receive answers.
  const questions = shuffle(bank.questions).map((q) => {
    const optionOrder = shuffle(q.options.map((_, i) => i));
    return {
      id: q.id,
      text: q.text,
      options: optionOrder.map((i) => q.options[i]),
      // We send the shuffled order back so the attempt-submission endpoint
      // can map the student's selected option back to the original index.
      optionOrder,
    };
  });

  return NextResponse.json({ questionBankId: bank.id, questions });
}
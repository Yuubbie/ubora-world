import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireTier } from "@/lib/access";

// Must match the same constant used in the questions route, so the sets
// this endpoint describes line up exactly with what /questions will serve.
const SET_SIZE = 30;

export async function GET(_req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const gate = await requireTier((session.user as any).id, "standard");
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 403 });

  const bank = await db.questionBank.findFirst({
    where: { courseId: courseId, status: "approved" },
    include: { questions: { select: { id: true, module: true } } },
  });

  if (!bank) return NextResponse.json({ error: "no_approved_question_bank" }, { status: 404 });

  // Group question IDs by module number (0 = unsorted/no module set).
  const byModule = new Map<number, string[]>();
  for (const q of bank.questions) {
    const m = q.module ?? 0;
    if (!byModule.has(m)) byModule.set(m, []);
    byModule.get(m)!.push(q.id);
  }

  // For each module, sort its question IDs deterministically (so "Set 1"
  // always means the same 30 questions every time this is called), then
  // chop into fixed-size sets. The LAST set in a module absorbs whatever
  // remainder is left, so nothing is ever dropped.
  const sets: { module: number; set: number; count: number }[] = [];
  for (const [moduleNum, ids] of byModule.entries()) {
    const sortedIds = [...ids].sort(); // stable, deterministic ordering
    const totalSets = Math.ceil(sortedIds.length / SET_SIZE);
    for (let s = 1; s <= totalSets; s++) {
      const start = (s - 1) * SET_SIZE;
      const end = Math.min(start + SET_SIZE, sortedIds.length);
      sets.push({ module: moduleNum, set: s, count: end - start });
    }
  }

  sets.sort((a, b) => (a.module - b.module) || (a.set - b.set));

  return NextResponse.json({ sets, setSize: SET_SIZE });
}

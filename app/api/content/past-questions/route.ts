import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireTier } from "@/lib/access";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const gate = await requireTier((session.user as any).id, "basic");
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  const sets = await db.pastQuestionSet.findMany({
    where: { status: "approved", ...(courseId ? { courseId } : {}) },
    select: { id: true, year: true, courseId: true, fileUrl: true },
    orderBy: { year: "desc" },
  });

  return NextResponse.json(sets);
}

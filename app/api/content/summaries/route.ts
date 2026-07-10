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

  // Spec 6.6: only `approved` content is ever visible to a student, no exceptions.
  const summaries = await db.summary.findMany({
    where: { status: "approved", ...(courseId ? { courseId } : {}) },
    select: { id: true, title: true, topicCount: true, pageCount: true, courseId: true },
    // fileUrl intentionally excluded here — download link is a premium-tier
    // action, resolved by a separate endpoint that re-checks tier (6.2).
  });

  return NextResponse.json(summaries);
}

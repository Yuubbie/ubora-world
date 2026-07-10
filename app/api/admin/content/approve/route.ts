import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const bodySchema = z.object({
  type: z.enum(["questionBank", "summary", "pastQuestionSet", "tutorialContent"]),
  id: z.string(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  // Spec 6.6 rule 2: only a content_partner or admin/super_admin can approve.
  // The proxy already blocks non-admins from reaching /admin pages, but we
  // check again here since this API route could be called directly.
  if (!session?.user || !["content_partner", "admin", "super_admin"].includes(role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { type, id } = parsed.data;

  const approvedBy = (session.user as any).id;
  const approvedAt = new Date();

  // Spec 6.6 rule 3: approvedBy and approvedAt recorded on every approval — the audit trail.
  switch (type) {
    case "questionBank":
      await db.questionBank.update({ where: { id }, data: { status: "approved", approvedBy, approvedAt } });
      break;
    case "summary":
      await db.summary.update({ where: { id }, data: { status: "approved", approvedBy, approvedAt } });
      break;
    case "pastQuestionSet":
      await db.pastQuestionSet.update({ where: { id }, data: { status: "approved", approvedBy, approvedAt } });
      break;
    case "tutorialContent":
      await db.tutorialContent.update({ where: { id }, data: { status: "approved", approvedBy, approvedAt } });
      break;
  }

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireTier } from "@/lib/access";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ summaryId: string }> }
) {
  const { summaryId } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const summary = await db.summary.findUnique({ where: { id: summaryId } });
  if (!summary || summary.status !== "approved") {
    return NextResponse.json({ error: "Summary not found" }, { status: 404 });
  }

  const gate = await requireTier(userId, "basic");
  if (!gate.ok) {
    return NextResponse.json({ error: "Subscription required" }, { status: 403 });
  }

  if (!summary.fileData) {
    return NextResponse.json({ error: "File not available" }, { status: 404 });
  }

  const filename = summary.fileUrl.split("/").pop() || "summary.pdf";

  return new NextResponse(Buffer.from(summary.fileData), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      "Pragma": "no-cache",
    },
  });
}

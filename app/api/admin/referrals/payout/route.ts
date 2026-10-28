import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const bodySchema = z.object({
  payoutId: z.string().min(1),
  action: z.enum(["paid", "processing"]),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin" || session.user.email !== "yubbiepen.pixel@gmail.com") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const payout = await db.payout.findUnique({
    where: { id: parsed.data.payoutId },
    select: { id: true, status: true },
  });
  if (!payout) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (parsed.data.action === "processing") {
    await db.payout.update({
      where: { id: payout.id },
      data: { status: "processing" },
    });
    return NextResponse.json({ ok: true, status: "processing" });
  }

  await db.$transaction([
    db.payout.update({
      where: { id: payout.id },
      data: { status: "paid", paidAt: new Date() },
    }),
    db.commission.updateMany({
      where: { payoutId: payout.id },
      data: { status: "paid" },
    }),
  ]);

  return NextResponse.json({ ok: true, status: "paid" });
}

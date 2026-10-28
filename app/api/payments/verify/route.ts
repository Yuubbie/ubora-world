import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { confirmPaymentAndActivate } from "@/lib/confirmPayment";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");
  if (!reference) return NextResponse.json({ error: "missing_reference" }, { status: 400 });
  if (!reference.startsWith("uw_") || reference.length > 80) {
    return NextResponse.json({ error: "invalid_reference" }, { status: 400 });
  }

  const payment = await db.payment.findUnique({ where: { reference } });
  if (!payment) return NextResponse.json({ error: "unknown_reference" }, { status: 404 });

  const session = await getServerSession(authOptions);
  const sessionUserId = session?.user ? (session.user as { id?: string }).id : null;
  if (sessionUserId && sessionUserId !== payment.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const result = await confirmPaymentAndActivate(reference);
  return NextResponse.json(result);
}

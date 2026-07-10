import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { confirmPaymentAndActivate } from "@/lib/confirmPayment";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");
  if (!reference) return NextResponse.json({ error: "missing_reference" }, { status: 400 });

  const result = await confirmPaymentAndActivate(reference);
  return NextResponse.json(result);
}

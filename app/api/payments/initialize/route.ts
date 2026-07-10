import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { initializeTransaction } from "@/lib/paystack";
import { TIER_PRICES_KOBO, type Tier } from "@/lib/config";

const bodySchema = z.object({ tier: z.enum(["basic", "standard", "premium"]) });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const tier = parsed.data.tier as Tier;

  const user = await db.user.findUnique({ where: { id: (session.user as any).id } });
  if (!user?.email) {
    return NextResponse.json({ error: "account_has_no_email" }, { status: 400 });
  }

  const reference = `uw_${crypto.randomBytes(12).toString("hex")}`;
  const amountKobo = TIER_PRICES_KOBO[tier];

  // Payment starts as `pending` — only the verified webhook moves it to
  // `success` and creates the Subscription. Spec 6.1 rule 1: a subscription
  // is created only after Payment.status = success, never optimistically.
  await db.payment.create({
    data: { userId: user.id, amount: amountKobo, provider: "paystack", status: "pending", reference },
  });

  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const tx = await initializeTransaction({
    email: user.email,
    amountKobo,
    reference,
    callbackUrl: `${appUrl}/subscribe/callback`,
    metadata: { userId: user.id, tier },
  });

  return NextResponse.json({ authorizationUrl: tx.authorization_url });
}

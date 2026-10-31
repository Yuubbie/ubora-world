import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { initializeTransaction } from "@/lib/paystack";
import { TIER_PRICES_KOBO, type Tier, type BillingCycle } from "@/lib/config";
import { calculatePaystackTotal } from "@/lib/paystackFees";

// We added 'cycle' here so the frontend can tell us if they want monthly or semester
const bodySchema = z.object({ 
  tier: z.enum(["basic", "standard", "premium"]),
  cycle: z.enum(["monthly", "semester"]).default("semester")
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  
  const tier = parsed.data.tier as Tier;
  const cycle = parsed.data.cycle as BillingCycle;

  const user = await db.user.findUnique({ where: { id: (session.user as any).id } });
  if (!user?.email) {
    return NextResponse.json({ error: "account_has_no_email" }, { status: 400 });
  }
  if (user.role !== "student") {
    return NextResponse.json({ error: "students_only" }, { status: 403 });
  }

  const reference = `uw_${crypto.randomBytes(12).toString("hex")}`;
  const baseKobo = TIER_PRICES_KOBO[tier][cycle];
  const { feeKobo, grossKobo } = calculatePaystackTotal(baseKobo);

  await db.payment.create({
    data: { userId: user.id, amount: baseKobo, provider: "paystack", status: "pending", reference },
  });

  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const tx = await initializeTransaction({
    email: user.email,
    amountKobo: grossKobo,
    reference,
    callbackUrl: `${appUrl}/subscribe/callback`,
    metadata: {
      userId: user.id,
      tier,
      cycle,
      baseAmountKobo: baseKobo,
      feeKobo,
      grossAmountKobo: grossKobo,
    },
  });

  return NextResponse.json({ authorizationUrl: tx.authorization_url });
}
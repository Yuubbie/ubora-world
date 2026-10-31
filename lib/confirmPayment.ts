import { db } from "./db";
import { verifyTransaction } from "./paystack";
import { BILLING_CYCLES, TIER_PRICES_KOBO, type Tier, type BillingCycle } from "./config";
import { calculatePaystackTotal } from "./paystackFees";
import { creditReferralOnFirstPayment } from "./referral";
import type { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

function planFromAmount(amountKobo: number): { tier: Tier; cycle: BillingCycle } | null {
  const tiers = Object.keys(TIER_PRICES_KOBO) as Tier[];
  for (const tier of tiers) {
    const prices = TIER_PRICES_KOBO[tier];
    if (prices.monthly === amountKobo) return { tier, cycle: "monthly" };
    if (prices.semester === amountKobo) return { tier, cycle: "semester" };
  }
  return null;
}

function chargeMatchesBase(verifiedKobo: number, baseKobo: number) {
  return verifiedKobo === baseKobo || verifiedKobo === calculatePaystackTotal(baseKobo).grossKobo;
}

function resolvePlan(
  baseKobo: number,
  metadata: { tier?: unknown; cycle?: unknown } | null | undefined
): { tier: Tier; cycle: BillingCycle } | null {
  const fromAmount = planFromAmount(baseKobo);
  const metaTier = metadata?.tier;
  const metaCycle = metadata?.cycle;
  if (
    (metaTier === "basic" || metaTier === "standard" || metaTier === "premium") &&
    (metaCycle === "monthly" || metaCycle === "semester") &&
    TIER_PRICES_KOBO[metaTier][metaCycle] === baseKobo
  ) {
    return { tier: metaTier, cycle: metaCycle };
  }
  return fromAmount;
}

async function createPaidSubscription(
  client: DbClient,
  payment: { id: string; userId: string },
  plan: { tier: Tier; cycle: BillingCycle }
) {
  const startDate = new Date();
  const lengthDays = BILLING_CYCLES[plan.cycle];
  const endDate = new Date(startDate.getTime() + lengthDays * 24 * 60 * 60 * 1000);

  await client.subscription.updateMany({
    where: { userId: payment.userId, paymentId: null, status: "active" },
    data: { status: "expired", endDate: startDate },
  });

  try {
    await client.subscription.create({
      data: {
        userId: payment.userId,
        tier: plan.tier,
        startDate,
        endDate,
        status: "active",
        paymentId: payment.id,
      },
    });
  } catch (error) {
    const prismaCode = (error as { code?: string }).code;
    if (prismaCode !== "P2002") throw error;
  }
}

export type ConfirmResult =
  | { ok: true; alreadyProcessed: boolean }
  | { ok: false; reason: string };

/**
 * Verifies a payment reference directly with Paystack's API and, if genuinely
 * successful, activates the subscription. Safe to call more than once for the
 * same reference (idempotent) — this is what lets us call it from both the
 * webhook (production) and the checkout return page (works without a public
 * webhook URL, e.g. local development).
 */
export async function confirmPaymentAndActivate(reference: string): Promise<ConfirmResult> {
  const verified = await verifyTransaction(reference);
  if (verified.status !== "success") return { ok: false, reason: "not_successful" };

  const result = await db.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { reference } });
    if (!payment) return { ok: false as const, reason: "unknown_reference" };

    const plan = resolvePlan(payment.amount, verified.metadata);

    if (payment.status === "success") {
      const existing = await tx.subscription.findUnique({ where: { paymentId: payment.id } });
      if (!existing && plan && chargeMatchesBase(verified.amount, payment.amount)) {
        await createPaidSubscription(tx, payment, plan);
      } else {
        await tx.subscription.updateMany({
          where: { userId: payment.userId, paymentId: null, status: "active" },
          data: { status: "expired", endDate: new Date() },
        });
      }
      return { ok: true as const, alreadyProcessed: true, userId: payment.userId, amount: payment.amount };
    }

    if (!chargeMatchesBase(verified.amount, payment.amount)) {
      await tx.payment.update({ where: { reference }, data: { status: "failed" } });
      return { ok: false as const, reason: "amount_mismatch" };
    }

    if (!plan) {
      await tx.payment.update({ where: { reference }, data: { status: "failed" } });
      return { ok: false as const, reason: "unknown_plan" };
    }

    await tx.payment.update({ where: { reference }, data: { status: "success" } });
    await createPaidSubscription(tx, payment, plan);
    return { ok: true as const, alreadyProcessed: false, userId: payment.userId, amount: payment.amount };
  });

  if (result.ok) {
    await creditReferralOnFirstPayment(result.userId, result.amount);
    return { ok: true, alreadyProcessed: result.alreadyProcessed };
  }
  return { ok: false, reason: result.reason };
}

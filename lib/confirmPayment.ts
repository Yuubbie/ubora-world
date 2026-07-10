import { db } from "./db";
import { verifyTransaction } from "./paystack";
import { SUBSCRIPTION_LENGTH_DAYS, TIER_PRICES_KOBO, type Tier } from "./config";

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

  const payment = await db.payment.findUnique({ where: { reference } });
  if (!payment) return { ok: false, reason: "unknown_reference" };

  if (payment.status === "success") {
    return { ok: true, alreadyProcessed: true };
  }

  const tier = (verified.metadata?.tier ?? "basic") as Tier;
  const expectedAmount = TIER_PRICES_KOBO[tier];
  if (verified.amount !== expectedAmount) {
    await db.payment.update({ where: { reference }, data: { status: "failed" } });
    return { ok: false, reason: "amount_mismatch" };
  }

  await db.payment.update({ where: { reference }, data: { status: "success" } });

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + SUBSCRIPTION_LENGTH_DAYS * 24 * 60 * 60 * 1000);

  await db.subscription.create({
    data: { userId: payment.userId, tier, startDate, endDate, status: "active", paymentId: payment.id },
  });

  return { ok: true, alreadyProcessed: false };
}

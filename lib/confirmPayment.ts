import { db } from "./db";
import { verifyTransaction } from "./paystack";
// We import BILLING_CYCLES instead of the old SUBSCRIPTION_LENGTH_DAYS
import { BILLING_CYCLES, TIER_PRICES_KOBO, type Tier, type BillingCycle } from "./config";
import { creditReferralOnFirstPayment } from "./referral";

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
    await creditReferralOnFirstPayment(payment.userId, payment.amount);
    return { ok: true, alreadyProcessed: true };
  }

  // Read both tier and cycle from the Paystack metadata (default to semester for safety)
  const tier = (verified.metadata?.tier ?? "basic") as Tier;
  const cycle = (verified.metadata?.cycle ?? "semester") as BillingCycle;
  
  // Look up the exact price for that specific tier and cycle
  const expectedAmount = TIER_PRICES_KOBO[tier][cycle];
  
  if (verified.amount !== expectedAmount) {
    await db.payment.update({ where: { reference }, data: { status: "failed" } });
    return { ok: false, reason: "amount_mismatch" };
  }

  await db.payment.update({ where: { reference }, data: { status: "success" } });

  const startDate = new Date();
  
  // Calculate end date based on the cycle (30 days for monthly, 90 days for semester)
  const lengthDays = BILLING_CYCLES[cycle];
  const endDate = new Date(startDate.getTime() + lengthDays * 24 * 60 * 60 * 1000);

  // Create the active subscription record
  await db.subscription.create({
    data: { userId: payment.userId, tier, startDate, endDate, status: "active", paymentId: payment.id },
  });

  await creditReferralOnFirstPayment(payment.userId, payment.amount);

  return { ok: true, alreadyProcessed: false };
}
export const PAYSTACK_PERCENT = 0.015;
export const PAYSTACK_FLAT_KOBO = 10_000;
export const PAYSTACK_FLAT_WAIVER_KOBO = 250_000;
export const PAYSTACK_FEE_CAP_KOBO = 200_000;

export function paystackFeeOnAmount(amountKobo: number): number {
  const percentFee = Math.round(amountKobo * PAYSTACK_PERCENT);
  if (amountKobo < PAYSTACK_FLAT_WAIVER_KOBO) {
    return Math.min(percentFee, PAYSTACK_FEE_CAP_KOBO);
  }
  return Math.min(percentFee + PAYSTACK_FLAT_KOBO, PAYSTACK_FEE_CAP_KOBO);
}

export function calculatePaystackTotal(basePriceKobo: number) {
  if (!Number.isFinite(basePriceKobo) || basePriceKobo <= 0) {
    return { baseKobo: 0, feeKobo: 0, grossKobo: 0 };
  }

  const baseKobo = Math.round(basePriceKobo);
  let grossKobo =
    baseKobo >= PAYSTACK_FLAT_WAIVER_KOBO
      ? Math.round((baseKobo + PAYSTACK_FLAT_KOBO) / (1 - PAYSTACK_PERCENT))
      : Math.round(baseKobo / (1 - PAYSTACK_PERCENT));

  if (baseKobo < PAYSTACK_FLAT_WAIVER_KOBO && grossKobo >= PAYSTACK_FLAT_WAIVER_KOBO) {
    grossKobo = Math.round((baseKobo + PAYSTACK_FLAT_KOBO) / (1 - PAYSTACK_PERCENT));
  }

  if (grossKobo - baseKobo > PAYSTACK_FEE_CAP_KOBO) {
    grossKobo = baseKobo + PAYSTACK_FEE_CAP_KOBO;
  }

  for (let i = 0; i < 50 && grossKobo - paystackFeeOnAmount(grossKobo) < baseKobo; i++) {
    grossKobo += 1;
  }

  return {
    baseKobo,
    feeKobo: grossKobo - baseKobo,
    grossKobo,
  };
}

export function formatKoboNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG", {
    minimumFractionDigits: kobo % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

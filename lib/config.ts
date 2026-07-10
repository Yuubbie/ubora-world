// Master Spec Section 6.3 — grade bands must live in ONE place, not scattered
// across the codebase, since they may need tuning later.
export const GRADE_BANDS = {
  DISTINCTION_MIN: 70, // >=70% = Distinction
  PASS_MIN: 50,        // 50-69% = Pass, below = Needs Revision
} as const;

export function gradeFor(percentage: number): "Distinction" | "Pass" | "Needs Revision" {
  if (percentage >= GRADE_BANDS.DISTINCTION_MIN) return "Distinction";
  if (percentage >= GRADE_BANDS.PASS_MIN) return "Pass";
  return "Needs Revision";
}

// Master Spec Section 6.2 — content access by tier.
// tierRank lets us check "does tier X include tier Y's content" with a simple comparison.
export const TIER_RANK = { basic: 0, standard: 1, premium: 2 } as const;
export type Tier = keyof typeof TIER_RANK;

export function tierIncludes(subscriptionTier: Tier, requiredTier: Tier): boolean {
  return TIER_RANK[subscriptionTier] >= TIER_RANK[requiredTier];
}

// Master Spec Section 6.1 — subscription length.
export const SUBSCRIPTION_LENGTH_DAYS = 90; // 3 months
export const RENEWAL_REMINDER_DAYS_BEFORE = [7, 1];

// Prices in kobo (smallest Naira unit) — one place to change pricing, per
// semester (3 months). Placeholder amounts — set real prices before launch.
export const TIER_PRICES_KOBO: Record<Tier, number> = {
  basic: 150000,     // ₦1,500
  standard: 350000,  // ₦3,500
  premium: 600000,   // ₦6,000
};

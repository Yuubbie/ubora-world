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

// Master Spec Section 6.1 — subscription length & trials
export const BILLING_CYCLES = {
  monthly: 30,
  semester: 90
} as const;
export type BillingCycle = keyof typeof BILLING_CYCLES;

export const FREE_TRIAL_DAYS = 10; // New signups get exactly 10 days
export const RENEWAL_REMINDER_DAYS_BEFORE = [7, 1];

// Platform URLs & Contact
export const ENQUIRY_NUMBER = "0810 013 3673";
export const STUDENT_PORTAL_URL = "https://www.nouonline.nou.edu.ng/";

// Prices in kobo (smallest Naira unit) — one place to change pricing
// Basic: ₦2,000/mo or ₦4,500/sem | Standard: ₦3,000/mo or ₦7,500/sem | Premium: ₦3,500/mo or ₦9,000/sem
export const TIER_PRICES_KOBO: Record<Tier, { monthly: number; semester: number }> = {
  basic: { monthly: 200000, semester: 450000 },
  standard: { monthly: 300000, semester: 750000 },
  premium: { monthly: 350000, semester: 900000 },
};
// Master Spec Section 6.3 — grade bands must live in ONE place
export const GRADE_BANDS = {
  DISTINCTION_MIN: 70, 
  PASS_MIN: 50,        
} as const;

export function gradeFor(percentage: number): "Distinction" | "Pass" | "Needs Revision" {
  if (percentage >= GRADE_BANDS.DISTINCTION_MIN) return "Distinction";
  if (percentage >= GRADE_BANDS.PASS_MIN) return "Pass";
  return "Needs Revision";
}

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

// Added back for prisma/seed.ts compatibility
export const SUBSCRIPTION_LENGTH_DAYS = 90; 

export const FREE_TRIAL_HOURS = 24;
export const FREE_TRIAL_MS = FREE_TRIAL_HOURS * 60 * 60 * 1000; 
export const RENEWAL_REMINDER_DAYS_BEFORE = [7, 1];

// Platform URLs & Contact
export const ENQUIRY_NUMBER = "0810 013 3673";
export const STUDENT_PORTAL_URL = "https://www.nouonline.nou.edu.ng/";

export const REFERRAL_REWARD_KOBO = 100000;
export const REFERRAL_PAYABLE_AFTER_DAYS = 7;
export const REFERRAL_REQUIRED_CYCLE: BillingCycle = "semester";

export const TIER_PRICES_KOBO: Record<Tier, { monthly: number; semester: number }> = {
  basic: { monthly: 200000, semester: 450000 },
  standard: { monthly: 300000, semester: 750000 },
  premium: { monthly: 350000, semester: 900000 },
};

export function isSemesterPaymentAmount(amountKobo: number) {
  return Object.values(TIER_PRICES_KOBO).some((prices) => prices.semester === amountKobo);
}
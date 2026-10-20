import { db } from "@/lib/db";
import { FREE_TRIAL_DAYS } from "@/lib/config";

export function trialEndDate(from: Date) {
  return new Date(from.getTime() + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000);
}

export async function grantPremiumTrial(userId: string, startDate = new Date()) {
  const existing = await db.subscription.findFirst({
    where: { userId },
    select: { id: true },
  });
  if (existing) return null;

  const endDate = trialEndDate(startDate);
  return db.subscription.create({
    data: {
      userId,
      tier: "premium",
      startDate,
      endDate,
      status: endDate < new Date() ? "expired" : "active",
    },
  });
}

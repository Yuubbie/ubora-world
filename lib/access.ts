import { db } from "./db";
import { tierIncludes, type Tier } from "./config";

export type AccessState =
  | { active: false; tier: null }
  | { active: true; tier: Tier; endDate: Date };

/**
 * Master Spec 6.1 rule 3: expiry must be correct even if a background job hasn't
 * run yet — so we compute "is this subscription actually still active" live,
 * on every check, rather than trusting a possibly-stale `status` field alone.
 * (The scheduled job in Phase 2 keeps `status` correct for reporting; this
 * function is what actually gates access.)
 */
export async function getAccessState(userId: string): Promise<AccessState> {
  const sub = await db.subscription.findFirst({
    where: { userId, status: "active" },
    orderBy: { endDate: "desc" },
  });

  if (!sub) return { active: false, tier: null };
  if (sub.endDate < new Date()) return { active: false, tier: null };

  return { active: true, tier: sub.tier as Tier, endDate: sub.endDate };
}

/**
 * Master Spec 6.2 rule 4: tier is enforced server-side on every content
 * request. Call this in every API route that serves gated content — never
 * rely on the UI hiding a button as the only protection.
 */
export async function requireTier(userId: string, requiredTier: Tier): Promise<{ ok: boolean; reason?: string }> {
  const access = await getAccessState(userId);
  if (!access.active) return { ok: false, reason: "no_active_subscription" };
  if (!tierIncludes(access.tier, requiredTier)) return { ok: false, reason: "tier_too_low" };
  return { ok: true };
}

import { db } from "@/lib/db";

export async function expirePastDueSubscriptions() {
  const result = await db.subscription.updateMany({
    where: { status: "active", endDate: { lt: new Date() } },
    data: { status: "expired" },
  });
  return result.count;
}

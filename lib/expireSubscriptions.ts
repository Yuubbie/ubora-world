import { db } from "@/lib/db";
import { FREE_TRIAL_MS } from "@/lib/config";

export async function clampUnpaidStudentTrials() {
  const now = new Date();
  const unpaid = await db.subscription.findMany({
    where: {
      paymentId: null,
      user: { role: "student" },
    },
    select: { id: true, startDate: true, endDate: true, status: true },
  });

  let clamped = 0;
  for (const sub of unpaid) {
    const cap = new Date(sub.startDate.getTime() + FREE_TRIAL_MS);
    const endDate = cap < sub.endDate ? cap : sub.endDate;
    const status = endDate < now ? "expired" : sub.status === "expired" ? "expired" : "active";
    if (endDate.getTime() === sub.endDate.getTime() && status === sub.status) continue;

    await db.subscription.update({
      where: { id: sub.id },
      data: { endDate, status },
    });
    clamped += 1;
  }
  return clamped;
}

export async function expirePastDueSubscriptions() {
  await clampUnpaidStudentTrials();
  const result = await db.subscription.updateMany({
    where: { status: "active", endDate: { lt: new Date() } },
    data: { status: "expired" },
  });
  return result.count;
}

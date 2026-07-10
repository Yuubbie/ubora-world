// Run this on a schedule (e.g. daily) via Windows Task Scheduler, cron, or
// (once deployed) Vercel Cron / Railway Cron. It exists because
// lib/access.ts's live check protects content access correctly even without
// this job running — but admin reporting (e.g. "how many active subscribers
// do we have") needs the `status` field itself to be accurate, per Spec 6.1
// rule 3.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const result = await db.subscription.updateMany({
    where: { status: "active", endDate: { lt: new Date() } },
    data: { status: "expired" },
  });
  console.log(`Marked ${result.count} subscription(s) as expired.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => db.$disconnect());

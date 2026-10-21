import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const FREE_TRIAL_MS = 24 * 60 * 60 * 1000;

async function main() {
  const students = await db.user.findMany({
    where: {
      role: "student",
      subscriptions: { none: {} },
    },
    select: { id: true, email: true, fullName: true, createdAt: true },
  });

  let granted = 0;
  for (const user of students) {
    const endDate = new Date(user.createdAt.getTime() + FREE_TRIAL_MS);
    const now = new Date();
    await db.subscription.create({
      data: {
        userId: user.id,
        tier: "premium",
        startDate: user.createdAt,
        endDate,
        status: endDate < now ? "expired" : "active",
      },
    });
    granted += 1;
    console.log(`${endDate < now ? "expired" : "active"} trial for ${user.email || user.fullName}`);
  }

  console.log(`Granted ${granted} missing 24-hour Premium trial(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => db.$disconnect());

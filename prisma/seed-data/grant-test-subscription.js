/**
 * grant-test-subscription.js
 *
 * Gives your Demo Admin account an ACTIVE, STANDARD-tier subscription so
 * you can click through CBT Practice, Summaries, etc. exactly as a real
 * subscribed student would see them — purely for your own testing.
 *
 * WHAT THIS DOES:
 *   - Finds the user named "Demo Admin" (same account the seed script used).
 *   - Creates a Subscription row for that user: tier = standard,
 *     status = active, running for the next 365 days.
 *   - Does NOT touch Paystack, Payment records, or any real money/billing.
 *   - Does NOT affect any other user's subscription.
 *
 * HOW TO RUN (Windows, Command Prompt):
 *   1. Put this file in: C:\Users\HP\Desktop\ubora-world\prisma\seed-data\
 *   2. Run:
 *        cd C:\Users\HP\Desktop\ubora-world
 *        node prisma\seed-data\grant-test-subscription.js
 *
 * NOTE: this writes to whichever database your .env DATABASE_URL points
 * to — which, as we confirmed, is the same database your live site uses.
 * That's fine here since this is just a test subscription on an admin
 * account, not something a real student would be affected by.
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== Grant Test Subscription: Starting ===\n");

  const user = await prisma.user.findFirst({
    where: { fullName: "Demo Admin" },
  });

  if (!user) {
    console.log("Could not find a user named 'Demo Admin'. Nothing was changed.");
    await prisma.$disconnect();
    return;
  }
  console.log(`Found user: ${user.fullName} (${user.id})`);

  // Check for an existing active subscription first, so we don't create duplicates
  const existing = await prisma.subscription.findFirst({
    where: { userId: user.id, status: "active" },
  });

  if (existing) {
    console.log("This user already has an active subscription:");
    console.log(`  tier: ${existing.tier}, endDate: ${existing.endDate}`);
    console.log("No new subscription created.");
    await prisma.$disconnect();
    return;
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 365);

  const subscription = await prisma.subscription.create({
    data: {
      userId: user.id,
      tier: "standard",
      status: "active",
      startDate: startDate,
      endDate: endDate,
    },
  });

  console.log("\nCreated test subscription:");
  console.log(`  tier: ${subscription.tier}`);
  console.log(`  status: ${subscription.status}`);
  console.log(`  valid until: ${endDate.toDateString()}`);
  console.log("\nYou can now log in as Demo Admin and access Standard+ content,");
  console.log("including CSS121 CBT Practice, for testing purposes.");

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Script failed:");
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

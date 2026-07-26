/**
 * diagnose-css121.js
 *
 * READ-ONLY. Does not create, update, or delete anything.
 * Just prints out exactly what's in the database for CSS121, so we can
 * see the real state instead of guessing.
 *
 * HOW TO RUN:
 *   cd C:\Users\HP\Desktop\ubora-world
 *   node prisma\seed-data\diagnose-css121.js
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== CSS121 Diagnostic: Starting ===\n");

  const course = await prisma.course.findUnique({ where: { code: "CSS121" } });
  if (!course) {
    console.log("No Course found with code CSS121. Stopping.");
    await prisma.$disconnect();
    return;
  }
  console.log(`Course: ${course.title} (id: ${course.id})\n`);

  // Find ALL question banks for this course, regardless of status —
  // this is the key check: is there more than one?
  const banks = await prisma.questionBank.findMany({
    where: { courseId: course.id },
    include: { questions: true },
  });

  console.log(`Number of QuestionBanks found for this course: ${banks.length}\n`);

  for (const bank of banks) {
    console.log(`--- QuestionBank id: ${bank.id} ---`);
    console.log(`Status: ${bank.status}`);
    console.log(`Total questions in this bank: ${bank.questions.length}`);

    const moduleCounts = {};
    for (const q of bank.questions) {
      const m = q.module === null || q.module === undefined ? "NULL/undefined" : q.module;
      moduleCounts[m] = (moduleCounts[m] || 0) + 1;
    }
    console.log("Question counts by module value:", moduleCounts);
    console.log("");
  }

  console.log("=== Diagnostic Complete ===");
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Diagnostic script failed:");
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

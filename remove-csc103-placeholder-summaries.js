// remove-csc103-placeholder-summaries.js
// Deletes CSC 103 summary records that point at the fake
// "https://example.com/..." placeholder URLs left over from demo seed data.
// Safe to run once.
//
// Run from the project root:
//   node remove-csc103-placeholder-summaries.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findUnique({ where: { code: 'CSC 103' } });
  if (!course) {
    console.error('CSC 103 course not found.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const placeholders = await prisma.summary.findMany({
    where: {
      courseId: course.id,
      fileUrl: { contains: 'example.com' },
    },
  });

  if (placeholders.length === 0) {
    console.log('No placeholder summaries found for CSC 103. Nothing to delete.');
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${placeholders.length} placeholder summary record(s):`);
  for (const p of placeholders) {
    console.log(`  - ${p.id} | ${p.title} | ${p.fileUrl}`);
  }

  const result = await prisma.summary.deleteMany({
    where: {
      courseId: course.id,
      fileUrl: { contains: 'example.com' },
    },
  });

  console.log(`Deleted ${result.count} placeholder summary record(s).`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Delete failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});

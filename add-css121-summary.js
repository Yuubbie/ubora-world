// add-css121-summary.js
// Creates the Summary record for CSS121, pointing at the static PDF file
// that must already be placed in public/summaries/css121-summary.pdf
// in the project (see instructions).
//
// Run from the project root:
//   node add-css121-summary.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findUnique({ where: { code: 'CSS121' } });
  if (!course) {
    console.error('CSS121 course not found.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const existing = await prisma.summary.findFirst({ where: { courseId: course.id } });
  if (existing) {
    console.log('A summary already exists for CSS121:', existing.id);
    console.log('Skipping creation to avoid duplicates.');
    await prisma.$disconnect();
    return;
  }

  const summary = await prisma.summary.create({
    data: {
      courseId: course.id,
      title: 'CSS121 Course Summary - Introduction to Psychology',
      topicCount: 20,
      pageCount: 5,
      fileUrl: '/summaries/css121-summary.pdf',
      status: 'approved',
      approvedBy: 'system-seed-css121',
      approvedAt: new Date(),
    },
  });

  console.log('Summary created:', summary.id);
  console.log('fileUrl:', summary.fileUrl);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Summary seed failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});

// add-gst102-summary.js
// Creates the Summary record for GST102, pointing at the static PDF file
// that must already be placed in public/summaries/gst102-summary.pdf
// in the project (see instructions).
//
// Run from the project root:
//   node add-gst102-summary.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findUnique({ where: { code: 'GST102' } });
  if (!course) {
    console.error('GST102 course not found. Run seed-gst102.js first.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const existing = await prisma.summary.findFirst({ where: { courseId: course.id } });
  if (existing) {
    console.log('A summary already exists for GST102:', existing.id);
    console.log('Skipping creation to avoid duplicates.');
    await prisma.$disconnect();
    return;
  }

  const summary = await prisma.summary.create({
    data: {
      courseId: course.id,
      title: 'GST102 Course Summary - Use of English and Communication Skills II',
      topicCount: 20,
      pageCount: 5,
      fileUrl: '/summaries/gst102-summary.pdf',
      status: 'approved',
      approvedBy: 'system-seed-gst102',
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

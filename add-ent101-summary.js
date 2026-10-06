// add-ent101-summary.js
// Creates the Summary record for ENT101 (Introduction to Entrepreneurship).
//
// SECURITY: same pattern as the other add-*-summary.js scripts - the PDF
// is read from the non-public private-uploads/ folder and its raw bytes
// go straight into Summary.fileData, served only via the authenticated
// route at app/api/summaries/[summaryId]/route.ts. fileUrl is a
// non-resolvable placeholder, never a real public path.
//
// BEFORE RUNNING:
//   1. Place the finished PDF at:
//        private-uploads/ent101-summary.pdf
//   2. Confirm ENT101 has already been seeded (seed-ent101.js).
//
// Run from the project root:
//   node add-ent101-summary.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const PDF_PATH = path.join(process.cwd(), 'private-uploads', 'ent101-summary.pdf');

async function main() {
  const course = await prisma.course.findUnique({ where: { code: 'ENT101' } });
  if (!course) {
    console.error('ENT101 course not found. Run seed-ent101.js first.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const existing = await prisma.summary.findFirst({ where: { courseId: course.id } });
  if (existing) {
    console.log('A summary already exists for ENT101:', existing.id);
    console.log('Skipping creation to avoid duplicates.');
    await prisma.$disconnect();
    return;
  }

  if (!fs.existsSync(PDF_PATH)) {
    console.error(`PDF not found at expected path: ${PDF_PATH}`);
    console.error('Place ent101-summary.pdf in the private-uploads folder and re-run.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const buffer = fs.readFileSync(PDF_PATH);
  console.log(`Read ${buffer.length} bytes from ${PDF_PATH}`);

  const summary = await prisma.summary.create({
    data: {
      courseId: course.id,
      title: 'ENT101 Course Summary - Introduction to Entrepreneurship',
      topicCount: 16,
      pageCount: 4,
      fileUrl: 'db-stored:ent101-summary',
      fileData: buffer,
      status: 'draft',
    },
  });

  console.log('Summary created:', summary.id);
  console.log('fileData bytes stored:', buffer.length);
  console.log('fileUrl (placeholder, not servable):', summary.fileUrl);
  console.log('Status: draft - go to /admin/content to review and approve.');
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Summary seed failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});

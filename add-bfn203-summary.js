// add-bfn203-summary.js
// Creates the Summary record for BFN203 (Basic Financial Literacy).
//
// SECURITY: same pattern as the other add-*-summary.js scripts - the PDF
// is read from the non-public private-uploads/ folder and its raw bytes
// go straight into Summary.fileData, served only via the authenticated
// route at app/api/summaries/[id]/route.ts. fileUrl is a
// non-resolvable placeholder, never a real public path.
//
// Stored as BFN203 (student list). The printed guide is titled ENT 207.
//
// BEFORE RUNNING:
//   1. Place the finished PDF at:
//        private-uploads/bfn203-summary.pdf
//   2. Confirm BFN203 has already been seeded (seed-bfn203.js).
//
// Run from the project root:
//   node add-bfn203-summary.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const PDF_PATH = path.join(process.cwd(), 'private-uploads', 'bfn203-summary.pdf');

async function main() {
  const course = await prisma.course.findUnique({ where: { code: 'BFN203' } });
  if (!course) {
    console.error('BFN203 course not found. Run seed-bfn203.js first.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const existing = await prisma.summary.findFirst({ where: { courseId: course.id } });
  if (existing) {
    console.log('A summary already exists for BFN203:', existing.id);
    console.log('Skipping creation to avoid duplicates.');
    await prisma.$disconnect();
    return;
  }

  if (!fs.existsSync(PDF_PATH)) {
    console.error(`PDF not found at expected path: ${PDF_PATH}`);
    console.error('Place bfn203-summary.pdf in the private-uploads folder and re-run.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const buffer = fs.readFileSync(PDF_PATH);
  console.log(`Read ${buffer.length} bytes from ${PDF_PATH}`);

  const summary = await prisma.summary.create({
    data: {
      courseId: course.id,
      title: 'BFN203 Course Summary - Basic Financial Literacy',
      topicCount: 18,
      pageCount: 4,
      fileUrl: 'db-stored:bfn203-summary',
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

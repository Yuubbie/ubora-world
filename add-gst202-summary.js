// add-gst202-summary.js
// Creates the Summary record for GST202 (Fundamentals of Peace Studies
// and Conflict Resolution).
//
// SECURITY: same pattern as the other add-*-summary.js scripts - the PDF
// is read from the non-public private-uploads/ folder and its raw bytes
// go straight into Summary.fileData, which is what the authenticated
// route at app/api/summaries/[summaryId]/route.ts serves from. fileUrl
// is set to a non-resolvable placeholder, never a real public path.
//
// Status is set to 'draft', consistent with the other summary scripts.
// Since GST202 is a GST course, once approved, this summary will be
// visible to students in all 39 departments - the same as the question
// bank.
//
// BEFORE RUNNING:
//   1. Place the finished PDF at:
//        C:\Users\HP\Desktop\ubora-world\private-uploads\gst202-summary.pdf
//   2. Confirm GST202 has already been seeded (seed-gst202.js).
//
// Run from the project root:
//   node add-gst202-summary.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const PDF_PATH = path.join(process.cwd(), 'private-uploads', 'gst202-summary.pdf');

async function main() {
  const course = await prisma.course.findUnique({ where: { code: 'GST202' } });
  if (!course) {
    console.error('GST202 course not found. Run seed-gst202.js first.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const existing = await prisma.summary.findFirst({ where: { courseId: course.id } });
  if (existing) {
    console.log('A summary already exists for GST202:', existing.id);
    console.log('Skipping creation to avoid duplicates.');
    await prisma.$disconnect();
    return;
  }

  if (!fs.existsSync(PDF_PATH)) {
    console.error(`PDF not found at expected path: ${PDF_PATH}`);
    console.error('Place gst202-summary.pdf in the private-uploads folder and re-run.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const buffer = fs.readFileSync(PDF_PATH);
  console.log(`Read ${buffer.length} bytes from ${PDF_PATH}`);

  const summary = await prisma.summary.create({
    data: {
      courseId: course.id,
      title: 'GST202 Course Summary - Fundamentals of Peace Studies and Conflict Resolution',
      topicCount: 15,
      pageCount: 4,
      fileUrl: 'db-stored:gst202-summary',
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

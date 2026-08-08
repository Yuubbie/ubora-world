// add-css111-summary.js
// Creates the Summary record for CSS111 (Introduction to Sociology).
//
// SECURITY: same pattern as add-gst105-summary.js - the PDF is read from
// the non-public private-uploads/ folder and its raw bytes go straight
// into Summary.fileData, which is what the authenticated route at
// app/api/summaries/[summaryId]/route.ts serves from. fileUrl is set to
// a non-resolvable placeholder, never a real public path.
//
// CHANGE FROM EARLIER SUMMARY SCRIPTS: GST105/GST102/CSS121's summary
// scripts set status: 'approved' directly, bypassing the admin review
// queue entirely - only their question banks went through review. This
// script instead sets status: 'draft', so CSS111's summary shows up in
// the same /admin/content review queue as its questions did, for a
// real review before it's visible to students. Approve it there, not
// via a status-flipping script, to keep an honest approvedBy audit trail.
//
// BEFORE RUNNING:
//   1. Place the finished PDF at:
//        C:\Users\HP\Desktop\ubora-world\private-uploads\css111-summary.pdf
//   2. Confirm CSS111 has already been seeded (seed-css111.js), since this
//      script only attaches a Summary to the existing Course row - it does
//      not create or modify the Course itself.
//
// Run from the project root:
//   node add-css111-summary.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const PDF_PATH = path.join(process.cwd(), 'private-uploads', 'css111-summary.pdf');

async function main() {
  const course = await prisma.course.findUnique({ where: { code: 'CSS111' } });
  if (!course) {
    console.error('CSS111 course not found. Run seed-css111.js first.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const existing = await prisma.summary.findFirst({ where: { courseId: course.id } });
  if (existing) {
    console.log('A summary already exists for CSS111:', existing.id);
    console.log('Skipping creation to avoid duplicates.');
    await prisma.$disconnect();
    return;
  }

  if (!fs.existsSync(PDF_PATH)) {
    console.error(`PDF not found at expected path: ${PDF_PATH}`);
    console.error('Place css111-summary.pdf in the private-uploads folder and re-run.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const buffer = fs.readFileSync(PDF_PATH);
  console.log(`Read ${buffer.length} bytes from ${PDF_PATH}`);

  const summary = await prisma.summary.create({
    data: {
      courseId: course.id,
      title: 'CSS111 Course Summary - Introduction to Sociology',
      topicCount: 20,
      pageCount: 17,
      fileUrl: 'db-stored:css111-summary',
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

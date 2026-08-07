// add-gst105-summary.js
// Creates the Summary record for GST105 (History and Philosophy of Science).
//
// SECURITY NOTE: unlike the older add-gst102-summary.js pattern, this script
// does NOT place the PDF in public/summaries/ and does NOT rely on fileUrl
// to serve the file. The PDF is read directly from a non-public folder
// (private-uploads/) and its raw bytes are written straight into
// Summary.fileData, which is what the authenticated route at
// app/api/summaries/[summaryId]/route.ts actually serves from.
// fileUrl is a required schema field, so it is set to an obvious
// non-resolvable placeholder ("db-stored:...") rather than a real path -
// this makes it impossible for this file to ever be reachable as a static
// public asset, even by accident.
//
// BEFORE RUNNING:
//   1. Place the finished PDF at:
//        C:\Users\HP\Desktop\ubora-world\private-uploads\gst105-summary.pdf
//   2. Confirm GST105 has already been seeded (seed-gst105.js), since this
//      script only attaches a Summary to the existing Course row - it does
//      not create or modify the Course itself.
//
// Run from the project root:
//   node add-gst105-summary.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const PDF_PATH = path.join(process.cwd(), 'private-uploads', 'gst105-summary.pdf');

async function main() {
  const course = await prisma.course.findUnique({ where: { code: 'GST105' } });
  if (!course) {
    console.error('GST105 course not found. Run seed-gst105.js first.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const existing = await prisma.summary.findFirst({ where: { courseId: course.id } });
  if (existing) {
    console.log('A summary already exists for GST105:', existing.id);
    console.log('Skipping creation to avoid duplicates.');
    await prisma.$disconnect();
    return;
  }

  if (!fs.existsSync(PDF_PATH)) {
    console.error(`PDF not found at expected path: ${PDF_PATH}`);
    console.error('Place gst105-summary.pdf in the private-uploads folder and re-run.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const buffer = fs.readFileSync(PDF_PATH);
  console.log(`Read ${buffer.length} bytes from ${PDF_PATH}`);

  const summary = await prisma.summary.create({
    data: {
      courseId: course.id,
      title: 'GST105 Course Summary - History and Philosophy of Science',
      topicCount: 18,
      pageCount: 16,
      fileUrl: 'db-stored:gst105-summary',
      fileData: buffer,
      status: 'approved',
      approvedBy: 'system-seed-gst105',
      approvedAt: new Date(),
    },
  });

  console.log('Summary created:', summary.id);
  console.log('fileData bytes stored:', buffer.length);
  console.log('fileUrl (placeholder, not servable):', summary.fileUrl);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Summary seed failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});

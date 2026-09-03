// add-eco121-summary.js
// Creates the Summary record for ECO121 (Principles of Economics).
//
// SECURITY: same pattern as add-gst107-summary.js, add-css111-summary.js,
// and add-gst105-summary.js - the PDF is read from the non-public
// private-uploads/ folder and its raw bytes go straight into
// Summary.fileData, which is what the authenticated route at
// app/api/summaries/[summaryId]/route.ts serves from. fileUrl is set to
// a non-resolvable placeholder, never a real public path.
//
// Status is set to 'draft', consistent with the other summary scripts -
// so ECO121's summary shows up in the /admin/content review queue
// before going live, same as its questions did.
//
// BEFORE RUNNING:
//   1. Place the finished PDF at:
//        C:\Users\HP\Desktop\ubora-world\private-uploads\eco121-summary.pdf
//   2. Confirm ECO121 has already been seeded (seed-eco121.js), since this
//      script only attaches a Summary to the existing Course row - it does
//      not create or modify the Course itself.
//
// Run from the project root:
//   node add-eco121-summary.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const PDF_PATH = path.join(process.cwd(), 'private-uploads', 'eco121-summary.pdf');

async function main() {
  const course = await prisma.course.findUnique({ where: { code: 'ECO121' } });
  if (!course) {
    console.error('ECO121 course not found. Run seed-eco121.js first.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const existing = await prisma.summary.findFirst({ where: { courseId: course.id } });
  if (existing) {
    console.log('A summary already exists for ECO121:', existing.id);
    console.log('Skipping creation to avoid duplicates.');
    await prisma.$disconnect();
    return;
  }

  if (!fs.existsSync(PDF_PATH)) {
    console.error(`PDF not found at expected path: ${PDF_PATH}`);
    console.error('Place eco121-summary.pdf in the private-uploads folder and re-run.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const buffer = fs.readFileSync(PDF_PATH);
  console.log(`Read ${buffer.length} bytes from ${PDF_PATH}`);

  const summary = await prisma.summary.create({
    data: {
      courseId: course.id,
      title: 'ECO121 Course Summary - Principles of Economics',
      topicCount: 21,
      pageCount: 9,
      fileUrl: 'db-stored:eco121-summary',
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

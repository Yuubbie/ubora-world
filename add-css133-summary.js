// add-css133-summary.js
// Creates the Summary record for CSS133 (Introduction to Criminology I).
//
// SECURITY: same pattern as add-css111-summary.js and add-gst105-summary.js
// - the PDF is read from the non-public private-uploads/ folder and its
// raw bytes go straight into Summary.fileData, which is what the
// authenticated route at app/api/summaries/[summaryId]/route.ts serves
// from. fileUrl is set to a non-resolvable placeholder, never a real
// public path.
//
// Status is set to 'draft', consistent with the CSS111 summary script -
// so CSS133's summary shows up in the /admin/content review queue
// before going live, same as its questions did.
//
// BEFORE RUNNING:
//   1. Place the finished PDF at:
//        C:\Users\HP\Desktop\ubora-world\private-uploads\css133-summary.pdf
//   2. Confirm CSS133 has already been seeded (seed-css133.js), since this
//      script only attaches a Summary to the existing Course row - it does
//      not create or modify the Course itself.
//
// Run from the project root:
//   node add-css133-summary.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const PDF_PATH = path.join(process.cwd(), 'private-uploads', 'css133-summary.pdf');

async function main() {
  const course = await prisma.course.findUnique({ where: { code: 'CSS133' } });
  if (!course) {
    console.error('CSS133 course not found. Run seed-css133.js first.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const existing = await prisma.summary.findFirst({ where: { courseId: course.id } });
  if (existing) {
    console.log('A summary already exists for CSS133:', existing.id);
    console.log('Skipping creation to avoid duplicates.');
    await prisma.$disconnect();
    return;
  }

  if (!fs.existsSync(PDF_PATH)) {
    console.error(`PDF not found at expected path: ${PDF_PATH}`);
    console.error('Place css133-summary.pdf in the private-uploads folder and re-run.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const buffer = fs.readFileSync(PDF_PATH);
  console.log(`Read ${buffer.length} bytes from ${PDF_PATH}`);

  const summary = await prisma.summary.create({
    data: {
      courseId: course.id,
      title: 'CSS133 Course Summary - Introduction to Criminology I',
      topicCount: 12,
      pageCount: 12,
      fileUrl: 'db-stored:css133-summary',
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

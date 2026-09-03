// add-cit104-summary.js
// Creates the Summary record for CIT104 (Introduction to Computers).
//
// SECURITY: same pattern as add-eco121-summary.js, add-pcr111-summary.js,
// and add-gst107-summary.js - the PDF is read from the non-public
// private-uploads/ folder and its raw bytes go straight into
// Summary.fileData, which is what the authenticated route at
// app/api/summaries/[summaryId]/route.ts serves from. fileUrl is set to
// a non-resolvable placeholder, never a real public path.
//
// Status is set to 'draft', consistent with the other summary scripts -
// so CIT104's summary shows up in the /admin/content review queue
// before going live, same as its questions did.
//
// BEFORE RUNNING:
//   1. Place the finished PDF at:
//        C:\Users\HP\Desktop\ubora-world\private-uploads\cit104-summary.pdf
//   2. Confirm CIT104 has already been seeded (seed-cit104.js), since this
//      script only attaches a Summary to the existing Course row - it does
//      not create or modify the Course itself.
//
// Run from the project root:
//   node add-cit104-summary.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const PDF_PATH = path.join(process.cwd(), 'private-uploads', 'cit104-summary.pdf');

async function main() {
  const course = await prisma.course.findUnique({ where: { code: 'CIT104' } });
  if (!course) {
    console.error('CIT104 course not found. Run seed-cit104.js first.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const existing = await prisma.summary.findFirst({ where: { courseId: course.id } });
  if (existing) {
    console.log('A summary already exists for CIT104:', existing.id);
    console.log('Skipping creation to avoid duplicates.');
    await prisma.$disconnect();
    return;
  }

  if (!fs.existsSync(PDF_PATH)) {
    console.error(`PDF not found at expected path: ${PDF_PATH}`);
    console.error('Place cit104-summary.pdf in the private-uploads folder and re-run.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const buffer = fs.readFileSync(PDF_PATH);
  console.log(`Read ${buffer.length} bytes from ${PDF_PATH}`);

  const summary = await prisma.summary.create({
    data: {
      courseId: course.id,
      title: 'CIT104 Course Summary - Introduction to Computers',
      topicCount: 17,
      pageCount: 8,
      fileUrl: 'db-stored:cit104-summary',
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

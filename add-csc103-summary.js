// add-csc103-summary.js
// Creates the Summary record for CSC 103 (Introduction to Computer Science).
//
// SECURITY: same pattern as the other add-*-summary.js scripts - the PDF
// is read from the non-public private-uploads/ folder and its raw bytes
// go straight into Summary.fileData, served only via the authenticated
// route at app/api/summaries/[id]/route.ts. fileUrl is a
// non-resolvable placeholder, never a real public path.
//
// BEFORE RUNNING:
//   1. Place the finished PDF at:
//        private-uploads/csc103-summary.pdf
//   2. Confirm CSC 103 already exists in the database (it does).
//
// Run from the project root:
//   node add-csc103-summary.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const COURSE_CODE = 'CSC 103';
const PDF_PATH = path.join(process.cwd(), 'private-uploads', 'csc103-summary.pdf');

async function main() {
  const course = await prisma.course.findUnique({ where: { code: COURSE_CODE } });
  if (!course) {
    console.error(`${COURSE_CODE} course not found.`);
    await prisma.$disconnect();
    process.exit(1);
  }

  const existing = await prisma.summary.findFirst({ where: { courseId: course.id } });
  if (existing) {
    console.log(`A summary already exists for ${COURSE_CODE}:`, existing.id);
    console.log('Skipping creation to avoid duplicates.');
    await prisma.$disconnect();
    return;
  }

  if (!fs.existsSync(PDF_PATH)) {
    console.error(`PDF not found at expected path: ${PDF_PATH}`);
    console.error('Place csc103-summary.pdf in the private-uploads folder and re-run.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const buffer = fs.readFileSync(PDF_PATH);
  console.log(`Read ${buffer.length} bytes from ${PDF_PATH}`);

  const summary = await prisma.summary.create({
    data: {
      courseId: course.id,
      title: 'CSC 103 Course Summary - Introduction to Computer Science',
      topicCount: 5,
      pageCount: 2,
      fileUrl: 'db-stored:csc103-summary',
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

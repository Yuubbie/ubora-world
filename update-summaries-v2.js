// update-summaries-v2.js
// Replaces fileData and pageCount for GST101, CSS121, and GST102 summaries
// with the new deeper v2 versions. Reads the v2 PDFs from the project's
// public/summaries-v2/ staging folder (see instructions) and updates the
// existing Summary records in place - does not create new records.
//
// Run from the project root:
//   node update-summaries-v2.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const UPDATES = [
  { code: 'GST101', filename: 'gst101-summary-v2.pdf', pageCount: 10 },
  { code: 'CSS121', filename: 'css121-summary-v2.pdf', pageCount: 9 },
  { code: 'GST102', filename: 'gst102-summary-v2.pdf', pageCount: 9 },
];

async function main() {
  for (const u of UPDATES) {
    const course = await prisma.course.findUnique({ where: { code: u.code } });
    if (!course) {
      console.error(`  ${u.code}: course not found, skipping.`);
      continue;
    }

    const summary = await prisma.summary.findFirst({ where: { courseId: course.id } });
    if (!summary) {
      console.error(`  ${u.code}: no summary record found, skipping.`);
      continue;
    }

    const filePath = path.join(process.cwd(), 'summaries-v2-staging', u.filename);
    if (!fs.existsSync(filePath)) {
      console.error(`  ${u.code}: staging file not found at ${filePath}, skipping.`);
      continue;
    }

    const buffer = fs.readFileSync(filePath);
    await prisma.summary.update({
      where: { id: summary.id },
      data: {
        fileData: buffer,
        pageCount: u.pageCount,
      },
    });
    console.log(`  ${u.code}: updated (${summary.id}) - ${buffer.length} bytes, pageCount=${u.pageCount}.`);
  }

  console.log('Done.');
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Update failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});

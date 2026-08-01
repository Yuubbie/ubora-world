// backfill-summary-filedata.js
// Reads the existing PDF files from public/summaries/ and stores their
// raw bytes in the new Summary.fileData column. Run this BEFORE deleting
// the public/summaries folder, since it needs to read those files.
// Safe to re-run - it skips any summary that already has fileData.
//
// Run from the project root:
//   node backfill-summary-filedata.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
  const summaries = await prisma.summary.findMany({
    where: { status: 'approved' },
    include: { course: { select: { code: true } } },
  });

  if (summaries.length === 0) {
    console.log('No approved summaries found.');
    await prisma.$disconnect();
    return;
  }

  for (const s of summaries) {
    if (s.fileData) {
      console.log(`Skipping ${s.course.code} (${s.id}) - already has fileData.`);
      continue;
    }

    // fileUrl currently looks like "/summaries/gst101-summary.pdf" -
    // extract just the filename and look for it in public/summaries/
    const filename = path.basename(s.fileUrl);
    const filePath = path.join(process.cwd(), 'public', 'summaries', filename);

    if (!fs.existsSync(filePath)) {
      console.error(`  FILE NOT FOUND for ${s.course.code}: ${filePath} - skipping.`);
      continue;
    }

    const buffer = fs.readFileSync(filePath);
    await prisma.summary.update({
      where: { id: s.id },
      data: { fileData: buffer },
    });
    console.log(`  Backfilled ${s.course.code} (${s.id}) - ${buffer.length} bytes stored.`);
  }

  console.log('Backfill complete.');
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Backfill failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});

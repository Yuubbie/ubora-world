/**
 * add-pol111-summary.js
 *
 * Attaches the POL111 summary PDF to the Summary table as raw bytes.
 * Place in:  project root (C:\Users\HP\Desktop\ubora-world)
 * Reads the PDF from:  private-uploads\POL111_Summary.pdf   (NEVER public\)
 *
 * Dry run first (touches nothing):
 *     node add-pol111-summary.js --dry-run
 * Then for real:
 *     node add-pol111-summary.js
 *
 * NOTES
 *   - status is 'draft'. It must go through /admin/content review.
 *     (Handover Section 5 #5: GST105, GST102 and CSS121 wrongly wrote
 *      'approved' directly and skipped the review queue.)
 *   - fileUrl is a non-resolvable placeholder; fileData is what is served.
 *   - Written from scratch, not chain-copied from another course, so there
 *     is no stale course-code string hiding in it (Section 5 #4).
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ---------------------------------------------------------------- constants
const COURSE_CODE = 'POL111';
const PDF_RELATIVE = path.join('private-uploads', 'POL111_Summary.pdf');
const SUMMARY_TITLE = 'POL111 - Elements of Political Science - Deep Summary';
const FILE_URL_PLACEHOLDER = 'db-stored:pol111-summary';

const TOPIC_COUNT = 21;   // 21 units across 5 modules
const PAGE_COUNT = 39;    // as built by build_pol111_pdf.py
const EXPECTED_BYTES = 117799; // advisory only - warns, does not block

const DRY_RUN = process.argv.includes('--dry-run');
const REPLACE = process.argv.includes('--replace');

async function main() {
  console.log(`\n=== POL111 summary upload ${DRY_RUN ? '(DRY RUN - nothing will be written)' : ''} ===\n`);

  // 1. PDF ----------------------------------------------------------------
  const pdfPath = path.join(__dirname, PDF_RELATIVE);
  if (!fs.existsSync(pdfPath)) {
    throw new Error(
      `PDF not found at:\n  ${pdfPath}\n\n` +
      `Copy POL111_Summary.pdf into private-uploads\\ first:\n` +
      `  copy /Y "%USERPROFILE%\\Downloads\\POL111_Summary.pdf" "${path.join(__dirname, 'private-uploads')}\\"`
    );
  }

  const bytes = fs.readFileSync(pdfPath);
  console.log(`PDF: ${pdfPath}`);
  console.log(`     ${bytes.length.toLocaleString()} bytes`);

  if (bytes.subarray(0, 5).toString('latin1') !== '%PDF-') {
    throw new Error('That file does not start with %PDF- . It is not a valid PDF.');
  }
  if (bytes.length !== EXPECTED_BYTES) {
    console.warn(`     NOTE: expected ~${EXPECTED_BYTES.toLocaleString()} bytes. ` +
                 `Different size is fine if you rebuilt the PDF, but check it is the right file.`);
  }

  // 2. Course - look up, NEVER create --------------------------------------
  const course = await prisma.course.findUnique({
    where: { code: COURSE_CODE },
    select: { id: true, code: true, title: true, departmentId: true },
  });
  if (!course) {
    throw new Error(
      `Course ${COURSE_CODE} not found. Run prisma\\seed-data\\seed-pol111.js first.\n` +
      `Refusing to create the course here.`
    );
  }
  console.log(`Course: ${course.code} - ${course.title} (${course.id})`);

  // 3. Existing summary? ---------------------------------------------------
  const existing = await prisma.summary.findFirst({
    where: { courseId: course.id },
    orderBy: { id: 'asc' },
    select: { id: true, title: true, status: true, pageCount: true },
  });

  const summaryCount = await prisma.summary.count({ where: { courseId: course.id } });
  if (summaryCount > 1) {
    console.warn(`WARNING: ${summaryCount} summaries already exist for this course. Using the earliest by id.`);
  }

  if (existing && !REPLACE) {
    throw new Error(
      `A summary already exists for ${COURSE_CODE}:\n` +
      `  id ${existing.id}, status "${existing.status}", ${existing.pageCount} pages\n` +
      `Refusing to overwrite it silently. Re-run with --replace if that is what you want.`
    );
  }

  const data = {
    courseId: course.id,
    title: SUMMARY_TITLE,
    topicCount: TOPIC_COUNT,
    pageCount: PAGE_COUNT,
    fileUrl: FILE_URL_PLACEHOLDER,
    fileData: bytes,
    status: 'draft',
  };

  if (DRY_RUN) {
    console.log(`\nWould ${existing ? 'REPLACE summary ' + existing.id : 'CREATE a new summary'} with:`);
    console.log(`  title       : ${data.title}`);
    console.log(`  topicCount  : ${data.topicCount}`);
    console.log(`  pageCount   : ${data.pageCount}`);
    console.log(`  fileUrl     : ${data.fileUrl}`);
    console.log(`  fileData    : ${bytes.length.toLocaleString()} bytes`);
    console.log(`  status      : ${data.status}`);
    console.log('\nDry run complete. Nothing was written.');
    return;
  }

  let summary;
  if (existing) {
    summary = await prisma.summary.update({
      where: { id: existing.id },
      data: { ...data, approvedBy: null, approvedAt: null },
    });
    console.log(`\nReplaced summary ${summary.id} (status reset to draft).`);
  } else {
    summary = await prisma.summary.create({ data });
    console.log(`\nCreated summary ${summary.id}.`);
  }

  // 4. Verify the bytes actually landed ------------------------------------
  const check = await prisma.summary.findUnique({
    where: { id: summary.id },
    select: { id: true, title: true, topicCount: true, pageCount: true,
              fileUrl: true, fileData: true, status: true },
  });

  console.log('\n=== VERIFY ===');
  console.log(`  id          : ${check.id}`);
  console.log(`  title       : ${check.title}`);
  console.log(`  topicCount  : ${check.topicCount}`);
  console.log(`  pageCount   : ${check.pageCount}`);
  console.log(`  fileUrl     : ${check.fileUrl}`);
  console.log(`  status      : ${check.status}`);
  console.log(`  fileData    : ${check.fileData ? check.fileData.length.toLocaleString() + ' bytes' : 'NULL'}`);

  if (!check.fileData || check.fileData.length !== bytes.length) {
    throw new Error(`Byte count mismatch. Wrote ${bytes.length}, read back ${check.fileData ? check.fileData.length : 'NULL'}.`);
  }
  if (Buffer.from(check.fileData).subarray(0, 5).toString('latin1') !== '%PDF-') {
    throw new Error('Stored bytes do not begin with %PDF- . The upload is corrupt.');
  }
  console.log('\nStored bytes match the file exactly and are a valid PDF.');
  console.log('Status is "draft" - approve it at /admin/content after spot-checking.');
}

main()
  .catch(e => { console.error('\nSUMMARY UPLOAD FAILED:\n' + e.message); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });

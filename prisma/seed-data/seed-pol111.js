/**
 * seed-pol111.js
 *
 * Seeds POL111 (Elements of Political Science) questions into the Ubora World DB.
 * Place in:  prisma\seed-data\
 * CSVs live alongside it: prisma\seed-data\pol111_module1.csv ... pol111_module5.csv
 *
 * Run a dry run first (touches nothing):
 *     node prisma\seed-data\seed-pol111.js --dry-run
 * Then for real:
 *     node prisma\seed-data\seed-pol111.js
 *
 * SAFETY (see handover Section 5, the CSS111 duplicate-department bug):
 *   - Looks up the department by EXACT confirmed name. Never creates one.
 *   - Cross-checks the department's facultyId against the confirmed Social Science
 *     faculty id, so a stray duplicate department with the right name cannot
 *     silently capture this course.
 *   - Exits loudly on any mismatch rather than guessing.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ---------------------------------------------------------------- constants
const COURSE_CODE = 'POL111';
const COURSE_TITLE = 'Elements of Political Science';
const COURSE_LEVEL = 100;
const COURSE_SEMESTER = 'first'; // Semester enum is lowercase: first | second

// Confirmed from the live DB on 29 Aug 2026 — do not edit without re-checking.
const DEPARTMENT_NAME = 'Political Science';
const EXPECTED_DEPARTMENT_ID = 'cms7arxwt0006sgbyf5hcu000';
const EXPECTED_FACULTY_ID = 'cms7arv4t0000sgby7ne4ixpl';

const CSV_FILES = [1, 2, 3, 4, 5].map(n => `pol111_module${n}.csv`);
const EXPECTED_TOTAL = 399;

const DRY_RUN = process.argv.includes('--dry-run');
const FIX_DEPARTMENT = process.argv.includes('--fix-department');

// ---------------------------------------------------------------- csv parser
// Minimal RFC4180 parser so we need no extra npm dependency.
// Handles quoted fields containing commas, quotes ("" escape) and newlines.
function parseCSV(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // strip UTF-8 BOM
  const rows = [];
  let row = [], field = '', inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field); field = '';
    } else if (ch === '\r') {
      // swallow; \n handles the break
    } else if (ch === '\n') {
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }

  const header = rows.shift();
  return rows.map(r => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

const LETTERS = ['A', 'B', 'C', 'D'];

function loadQuestions() {
  const all = [];
  for (const file of CSV_FILES) {
    const full = path.join(__dirname, file);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing CSV: ${full}\nCopy the five pol111_module*.csv files into prisma\\seed-data\\ first.`);
    }
    const rows = parseCSV(fs.readFileSync(full, 'utf8'));
    rows.forEach((r, idx) => {
      const where = `${file} row ${idx + 2}`;
      const options = [r.option_a, r.option_b, r.option_c, r.option_d];

      if (options.some(o => !o || !o.trim())) throw new Error(`${where}: blank option`);
      if (new Set(options).size !== 4) throw new Error(`${where}: duplicate option text`);

      const correctIndex = LETTERS.indexOf((r.correct_option || '').trim().toUpperCase());
      if (correctIndex === -1) throw new Error(`${where}: bad correct_option "${r.correct_option}"`);

      const moduleNum = parseInt(r.module, 10);
      if (!(moduleNum >= 1 && moduleNum <= 5)) throw new Error(`${where}: bad module "${r.module}"`);

      const text = (r.question_text || '').trim();
      if (!text) throw new Error(`${where}: empty question_text`);

      all.push({
        text,
        options,
        correctOptionIndex: correctIndex,
        explanation: (r.explanation || '').trim() || null,
        module: moduleNum,
      });
    });
  }

  const seen = new Set();
  for (const q of all) {
    if (seen.has(q.text)) throw new Error(`Duplicate question text in CSVs: ${q.text.slice(0, 70)}...`);
    seen.add(q.text);
  }
  return all;
}

// ---------------------------------------------------------------- main
async function main() {
  console.log(`\n=== POL111 question seed ${DRY_RUN ? '(DRY RUN - nothing will be written)' : ''} ===\n`);

  // 1. Questions from CSV -------------------------------------------------
  const questions = loadQuestions();
  console.log(`Parsed ${questions.length} questions from ${CSV_FILES.length} CSV files.`);
  if (questions.length !== EXPECTED_TOTAL) {
    console.warn(`  WARNING: expected ${EXPECTED_TOTAL}, got ${questions.length}. Check the CSVs before continuing.`);
  }
  const perModule = {};
  questions.forEach(q => { perModule[q.module] = (perModule[q.module] || 0) + 1; });
  console.log('  Per module:', JSON.stringify(perModule));

  // 2. Department — look up, NEVER create ---------------------------------
  const departments = await prisma.department.findMany({
    where: { name: DEPARTMENT_NAME },
    select: { id: true, name: true, facultyId: true },
  });

  if (departments.length === 0) {
    throw new Error(
      `Department "${DEPARTMENT_NAME}" NOT FOUND.\n` +
      `Refusing to create one (see handover Section 5 - the CSS111 duplicate-department bug).\n` +
      `List the real names with:\n` +
      `  node -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.department.findMany({select:{id:true,name:true}}).then(d=>{console.log(d);return p.$disconnect()})"`
    );
  }
  if (departments.length > 1) {
    throw new Error(
      `Found ${departments.length} departments named "${DEPARTMENT_NAME}". Refusing to guess.\n` +
      JSON.stringify(departments, null, 2)
    );
  }

  const department = departments[0];
  if (department.id !== EXPECTED_DEPARTMENT_ID) {
    throw new Error(
      `Department id mismatch.\n  expected ${EXPECTED_DEPARTMENT_ID}\n  found    ${department.id}\n` +
      `The DB has changed since this script was written. Verify before proceeding.`
    );
  }
  if (department.facultyId !== EXPECTED_FACULTY_ID) {
    throw new Error(
      `Department "${DEPARTMENT_NAME}" sits under faculty ${department.facultyId}, ` +
      `not the expected Social Science faculty ${EXPECTED_FACULTY_ID}.\n` +
      `This is exactly the shape of the CSS111 bug. Stopping.`
    );
  }
  const faculty = await prisma.faculty.findUnique({
    where: { id: department.facultyId }, select: { id: true, name: true },
  });
  console.log(`Department OK: "${department.name}" (${department.id}) under faculty "${faculty?.name}".`);

  // 3. Admin user for createdBy -------------------------------------------
  const admin = await prisma.user.findFirst({
    where: { role: { in: ['admin', 'super_admin'] } },
    select: { id: true, email: true, role: true },
    orderBy: { id: 'asc' },
  });
  if (!admin) throw new Error('No admin or super_admin user found. Cannot set QuestionBank.createdBy.');
  console.log(`Admin for createdBy: ${admin.email} (${admin.role})`);

  // 4. Course -------------------------------------------------------------
  let course = await prisma.course.findUnique({ where: { code: COURSE_CODE } });

  if (!course) {
    if (DRY_RUN) {
      console.log(`Would CREATE course ${COURSE_CODE} in department ${department.id}.`);
    } else {
      course = await prisma.course.create({
        data: {
          code: COURSE_CODE,
          title: COURSE_TITLE,
          departmentId: department.id,
          isGST: false,
          level: COURSE_LEVEL,
          semester: COURSE_SEMESTER,
        },
      });
      console.log(`Created course ${COURSE_CODE} (${course.id}).`);
    }
  } else {
    console.log(`Course ${COURSE_CODE} already exists (${course.id}).`);
    if (course.departmentId !== department.id) {
      if (!FIX_DEPARTMENT) {
        throw new Error(
          `Course ${COURSE_CODE} is attached to department ${course.departmentId}, ` +
          `not ${department.id} ("${DEPARTMENT_NAME}").\n` +
          `This is the CSS111 failure mode. Re-run with --fix-department to move it, ` +
          `after confirming that is what you want.`
        );
      }
      if (DRY_RUN) {
        console.log(`Would MOVE course to department ${department.id}.`);
      } else {
        course = await prisma.course.update({
          where: { id: course.id }, data: { departmentId: department.id },
        });
        console.log(`Moved course to department ${department.id}.`);
      }
    }
  }

  if (DRY_RUN && !course) {
    console.log('\nDry run stops here (course does not exist yet, so there is no bank to inspect).');
    console.log(`Would insert ${questions.length} questions.`);
    return;
  }

  // 5. QuestionBank — find the earliest, never create a second -------------
  let bank = await prisma.questionBank.findFirst({
    where: { courseId: course.id },
    orderBy: { id: 'asc' },
  });

  if (!bank) {
    if (DRY_RUN) {
      console.log('Would CREATE a QuestionBank (status: draft).');
    } else {
      bank = await prisma.questionBank.create({
        data: { courseId: course.id, status: 'draft', createdBy: admin.id },
      });
      console.log(`Created QuestionBank ${bank.id} (status: draft).`);
    }
  } else {
    const bankCount = await prisma.questionBank.count({ where: { courseId: course.id } });
    console.log(`Using existing QuestionBank ${bank.id} (status: ${bank.status}); ${bankCount} bank(s) exist for this course.`);
    if (bankCount > 1) console.warn('  WARNING: more than one QuestionBank for this course. Using the earliest by id.');
  }

  if (DRY_RUN && !bank) {
    console.log(`\nDry run: would insert ${questions.length} questions.`);
    return;
  }

  // 6. Dedupe by exact text, then insert ----------------------------------
  const existing = await prisma.question.findMany({
    where: { questionBankId: bank.id },
    select: { text: true },
  });
  const existingText = new Set(existing.map(q => q.text));
  const toInsert = questions.filter(q => !existingText.has(q.text));

  console.log(`\nAlready in bank: ${existing.length}`);
  console.log(`New to insert:   ${toInsert.length}`);
  console.log(`Skipped (dupes): ${questions.length - toInsert.length}`);

  if (DRY_RUN) {
    console.log('\nDry run complete. Nothing was written.');
    return;
  }

  if (toInsert.length) {
    let inserted = 0;
    const SIZE = 50;
    for (let i = 0; i < toInsert.length; i += SIZE) {
      const chunk = toInsert.slice(i, i + SIZE).map(q => ({
        questionBankId: bank.id,
        text: q.text,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation,
        module: q.module,
      }));
      const res = await prisma.question.createMany({ data: chunk, skipDuplicates: true });
      inserted += res.count;
      process.stdout.write(`  inserted ${inserted}/${toInsert.length}\r`);
    }
    console.log(`\nInserted ${inserted} questions.`);
  }

  // 7. Verify -------------------------------------------------------------
  const finalCount = await prisma.question.count({ where: { questionBankId: bank.id } });
  const grouped = await prisma.question.groupBy({
    by: ['module'],
    where: { questionBankId: bank.id },
    _count: { _all: true },
    orderBy: { module: 'asc' },
  });

  console.log(`\n=== VERIFY ===`);
  console.log(`Questions in bank ${bank.id}: ${finalCount}`);
  grouped.forEach(g => console.log(`  module ${g.module}: ${g._count._all}`));
  if (finalCount !== EXPECTED_TOTAL) {
    console.warn(`WARNING: bank holds ${finalCount}, expected ${EXPECTED_TOTAL}.`);
  } else {
    console.log('Count matches expected total.');
  }
  console.log(`\nQuestionBank status is "${bank.status}". Approve it at /admin/content after spot-checking.`);
}

main()
  .catch(e => { console.error('\nSEED FAILED:\n' + e.message); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });

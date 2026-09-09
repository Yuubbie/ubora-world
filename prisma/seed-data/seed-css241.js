/**
 * seed-css241.js
 *
 * Seeds CSS241 (Basic Security and Security Threats) into the
 * database.
 *
 * Uses the confirmed live department ID for Criminology and Security
 * Studies, pulled directly from crosslist-courses.js:
 *
 *   CRIMINOLOGY: 'cms7arwzd0002sgbyyjev2dn1'
 *
 * This is the FIRST 200-level FIRST SEMESTER course built for
 * Criminology - all previous 200L courses (CSS246, CSS244, PCR274,
 * CSS212, LAW212, MAC212) were second semester. Level is 200,
 * semester is "first", confirmed directly.
 *
 * This course is owned directly by Criminology (same as CSS111/121/
 * 133/112/132/134/246/244/212) - it is not a service course from
 * another department.
 *
 * NOTE - this course guide overlaps substantially in subject matter
 * with CSS244 (Types and Analysis of Security Threats) and CSS246
 * (Legal and Social Framework of Private Security Services) - all
 * three cover natural/manmade security threats and computer/
 * information security from similar angles. Every question in this
 * bank was grounded in CSS241's own specific source text (not copied
 * from the other two courses), and Module 4's content on Intelligence
 * and Counter-Intelligence (espionage tradecraft, MI-5, CIA, real
 * Nigerian cases) is genuinely unique to this course guide.
 *
 * IMPORTANT - per the corrected workflow: after running this script,
 * you MUST still run `node crosslist-courses.js` to backfill the
 * CourseDepartment link, even though this course is owned directly by
 * Criminology. Do not skip this step.
 *
 * This script does NOT create the department if missing - it fails
 * loudly instead.
 *
 * HOW TO RUN:
 *   cd C:\Users\HP\Desktop\ubora-world
 *   node prisma\seed-data\seed-css241.js
 *   node crosslist-courses.js --dry-run
 *   node crosslist-courses.js
 *
 * Place all 4 CSS241_CBT_Bank_Module1-4.csv files in the same folder
 * as this script (prisma\seed-data\) before running.
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

const CRIMINOLOGY_DEPARTMENT_ID = "cms7arwzd0002sgbyyjev2dn1";

function parseCSV(content) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const next = content[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(field);
        field = "";
      } else if (char === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (char === "\r") {
        // skip
      } else {
        field += char;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function loadQuestionsFromCSV(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const rows = parseCSV(content);
  const header = rows[0];
  const dataRows = rows.slice(1).filter((r) => r.length === header.length && r.some((c) => c.trim() !== ""));

  return dataRows.map((r) => {
    const record = {};
    header.forEach((col, idx) => {
      record[col.trim()] = r[idx];
    });
    return record;
  });
}

function letterToIndex(letter) {
  const map = { A: 0, B: 1, C: 2, D: 3 };
  const idx = map[(letter || "").trim().toUpperCase()];
  if (idx === undefined) {
    throw new Error(`Invalid correct_option value: "${letter}" (expected A, B, C, or D)`);
  }
  return idx;
}

async function main() {
  console.log("=== CSS241 Seed Script: Starting ===\n");

  const department = await prisma.department.findUnique({
    where: { id: CRIMINOLOGY_DEPARTMENT_ID },
  });
  if (!department) {
    console.error(`!!! STOPPING: Department with id '${CRIMINOLOGY_DEPARTMENT_ID}' not found.`);
    console.error("This script deliberately does not auto-create the department.");
    await prisma.$disconnect();
    process.exit(1);
  }
  console.log(`Found Department: ${department.name} (id: ${department.id})`);

  let course = await prisma.course.findUnique({ where: { code: "CSS241" } });
  if (!course) {
    course = await prisma.course.create({
      data: {
        code: "CSS241",
        title: "Basic Security and Security Threats",
        departmentId: department.id,
        level: 200,
        semester: "first",
      },
    });
    console.log("Created Course: CSS241 - Basic Security and Security Threats (200L, 1st semester)");
  } else {
    console.log("Found existing Course: CSS241");
  }

  const adminUser = await prisma.user.findFirst({
    where: { role: { in: ["admin", "super_admin"] } },
  });
  if (!adminUser) {
    console.log("\n!!! STOPPING: No admin or super_admin user was found in the database.");
    await prisma.$disconnect();
    process.exit(1);
  }
  console.log(`Using admin user as createdBy: ${adminUser.fullName} (${adminUser.id})`);

  let questionBank = await prisma.questionBank.findFirst({
    where: { courseId: course.id },
    orderBy: { id: "asc" },
  });
  if (!questionBank) {
    questionBank = await prisma.questionBank.create({
      data: { courseId: course.id, status: "draft", createdBy: adminUser.id },
    });
    console.log("Created new draft QuestionBank for CSS241");
  } else {
    console.log(`Found existing QuestionBank for CSS241 (status: ${questionBank.status}) - will add/update questions in it`);
  }

  const dir = __dirname;
  const csvFiles = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("CSS241_CBT_Bank_Module") && f.endsWith(".csv"));

  if (csvFiles.length === 0) {
    console.log("\nNo CSS241_CBT_Bank_Module*.csv files found next to this script.");
    await prisma.$disconnect();
    return;
  }

  let totalInserted = 0;
  let totalUpdated = 0;
  let totalErrors = 0;
  const moduleCounts = {};

  for (const file of csvFiles) {
    const filePath = path.join(dir, file);
    console.log(`\nReading ${file} ...`);
    const questions = loadQuestionsFromCSV(filePath);

    for (const q of questions) {
      try {
        const options = [q.option_a, q.option_b, q.option_c, q.option_d].map((s) => (s || "").trim());
        const correctOptionIndex = letterToIndex(q.correct_option);
        const explanation = (q.explanation || "").trim() || null;
        const moduleNum = parseInt((q.module || "").trim(), 10);
        if (Number.isNaN(moduleNum)) {
          throw new Error(`Missing or invalid module number for question: "${q.question_text}"`);
        }

        moduleCounts[moduleNum] = (moduleCounts[moduleNum] || 0) + 1;

        const existing = await prisma.question.findFirst({
          where: { questionBankId: questionBank.id, text: q.question_text },
        });

        if (existing) {
          await prisma.question.update({
            where: { id: existing.id },
            data: { options, correctOptionIndex, explanation, module: moduleNum },
          });
          totalUpdated++;
          continue;
        }

        await prisma.question.create({
          data: {
            questionBankId: questionBank.id,
            text: q.question_text,
            options,
            correctOptionIndex,
            explanation,
            module: moduleNum,
          },
        });
        totalInserted++;
      } catch (err) {
        console.log(`  Skipped a row due to error: ${err.message}`);
        totalErrors++;
      }
    }
    console.log(`  Done with ${file}`);
  }

  console.log(`\n=== Seed Complete ===`);
  console.log(`Newly inserted: ${totalInserted}`);
  console.log(`Updated: ${totalUpdated}`);
  console.log(`Errors/skipped: ${totalErrors}`);
  console.log(`Question counts per module (from this run):`, moduleCounts);
  console.log(`QuestionBank id: ${questionBank.id} (status: ${questionBank.status})`);
  console.log(`\nREMINDER: run 'node crosslist-courses.js' now, even though CSS241 is`);
  console.log(`owned directly by Criminology. That backfill step is required for the`);
  console.log(`course to actually appear in the app - do not skip it.`);
  console.log(`\nThis is the FIRST 200L FIRST-SEMESTER course built for Criminology.`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("\nSeed script failed with an error:");
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

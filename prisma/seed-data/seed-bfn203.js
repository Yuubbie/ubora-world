/**
 * seed-bfn203.js
 *
 * Seeds BFN203 (Basic Financial Literacy) into the database.
 *
 * Uses the confirmed live department ID for Banking and Finance:
 *
 *   BANKING_AND_FINANCE: 'cmtlzb26v000mpalnvmwd4kb2'
 *
 * The printed guide is titled ENT 207 Basic Financial Literacy (Araga,
 * 2017) and was written for Entrepreneurial Studies. The live student
 * list stores the course as BFN203, so this seed uses code BFN203 and
 * owns it under Banking and Finance. It is NOT a GST course. After
 * seeding, run `node crosslist-courses.js` so (1) the owning-department
 * CourseDepartment backfill row is created and (2) BFN203 is
 * cross-listed into Business Administration. Add BFN203 to CROSS_LISTINGS
 * for Business Administration only — do not add GST courses there.
 *
 * Course guide: ENT 207 Basic Financial Literacy, Dr. Sheu Abdullahi
 * Araga (Course Writer) - Department of Financial Studies, NOUN;
 * editor Prof. Olowe Rufus Ayodeji (UNILAG); HOD Dr. Lawal Kamaldeen
 * A. A (Entrepreneurial Studies); Dean Dr. Timothy Ishola. Semester
 * course of two credit units, 18 study units in 4 modules. Printed 2017.
 * Treated as 200L, first semester, stored as BFN203.
 *
 * HOW TO RUN:
 *   cd C:\Users\HP\Desktop\ubora-world
 *   node prisma\seed-data\seed-bfn203.js
 *   node crosslist-courses.js --dry-run
 *   node crosslist-courses.js
 *
 * Place all 4 BFN203_CBT_Bank_Module1-4.csv files in the same folder
 * as this script (prisma\seed-data\) before running.
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

const BANKING_AND_FINANCE_DEPARTMENT_ID = "cmtlzb26v000mpalnvmwd4kb2";

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
  console.log("=== BFN203 Seed Script: Starting ===\n");

  const department = await prisma.department.findUnique({
    where: { id: BANKING_AND_FINANCE_DEPARTMENT_ID },
  });
  if (!department) {
    console.error(`!!! STOPPING: Department with id '${BANKING_AND_FINANCE_DEPARTMENT_ID}' not found.`);
    console.error("This script deliberately does not auto-create the department.");
    await prisma.$disconnect();
    process.exit(1);
  }
  console.log(`Found Department: ${department.name} (id: ${department.id})`);

  let course = await prisma.course.findUnique({ where: { code: "BFN203" } });
  if (!course) {
    course = await prisma.course.create({
      data: {
        code: "BFN203",
        title: "Basic Financial Literacy",
        departmentId: department.id,
        level: 200,
        semester: "first",
      },
    });
    console.log("Created Course: BFN203 - Basic Financial Literacy (200L, 1st semester)");
  } else {
    console.log("Found existing Course: BFN203");
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
    console.log("Created new draft QuestionBank for BFN203");
  } else {
    console.log(`Found existing QuestionBank for BFN203 (status: ${questionBank.status}) - will add/update questions in it`);
  }

  const dir = __dirname;
  const csvFiles = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("BFN203_CBT_Bank_Module") && f.endsWith(".csv"));

  if (csvFiles.length === 0) {
    console.log("\nNo BFN203_CBT_Bank_Module*.csv files found next to this script.");
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
  console.log(`\nNEXT STEP: run 'node crosslist-courses.js' so BFN203 gets its`);
  console.log(`own-department CourseDepartment backfill AND is cross-listed into`);
  console.log(`Business Administration. Add BFN203 to CROSS_LISTINGS for Bus Admin.`);
  console.log(`Do not confuse the printed ENT 207 title with the stored code BFN203.`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("\nSeed script failed with an error:");
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

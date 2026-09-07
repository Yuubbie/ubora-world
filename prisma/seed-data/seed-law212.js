/**
 * seed-law212.js
 *
 * Seeds LAW212 (Nigerian Legal System II) into the database.
 *
 * UNLIKE every other seed script so far, this one creates a NEW
 * faculty and department if they don't already exist:
 *
 *   Faculty of Law -> Law department
 *
 * This is the first course built for the "minor" faculties Danielson
 * mentioned (Law, Agriculture, Arts, Health Sciences), which are being
 * built on demand rather than upfront like the 5 major faculties.
 *
 * LAW212 is owned by the new Law department but is cross-listed into
 * Criminology and Security Studies (a required Law course within the
 * Criminology curriculum) - confirmed directly. After running this
 * script, you MUST run `node crosslist-courses.js` to link it into
 * Criminology - do not skip this step.
 *
 * This script is idempotent for the faculty/department creation - safe
 * to re-run.
 *
 * HOW TO RUN:
 *   cd C:\Users\HP\Desktop\ubora-world
 *   node prisma\seed-data\seed-law212.js
 *   node crosslist-courses.js --dry-run
 *   node crosslist-courses.js
 *
 * Place all 4 LAW212_CBT_Bank_Module1-4.csv files in the same folder
 * as this script (prisma\seed-data\) before running.
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

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
  console.log("=== LAW212 Seed Script: Starting ===\n");

  // ---- 1. Ensure Faculty of Law exists ----
  let faculty = await prisma.faculty.findUnique({ where: { name: "Faculty of Law" } });
  if (!faculty) {
    faculty = await prisma.faculty.create({ data: { name: "Faculty of Law" } });
    console.log(`Created Faculty: Faculty of Law (id: ${faculty.id})`);
  } else {
    console.log(`Found existing Faculty: Faculty of Law (id: ${faculty.id})`);
  }

  // ---- 2. Ensure Law department exists ----
  let department = await prisma.department.findFirst({ where: { name: "Law", facultyId: faculty.id } });
  if (!department) {
    department = await prisma.department.create({ data: { name: "Law", facultyId: faculty.id } });
    console.log(`Created Department: Law (id: ${department.id})`);
  } else {
    console.log(`Found existing Department: Law (id: ${department.id})`);
  }

  // ---- 3. Ensure course exists ----
  let course = await prisma.course.findUnique({ where: { code: "LAW212" } });
  if (!course) {
    course = await prisma.course.create({
      data: {
        code: "LAW212",
        title: "Nigerian Legal System II",
        departmentId: department.id,
        level: 200,
        semester: "second",
      },
    });
    console.log("Created Course: LAW212 - Nigerian Legal System II (200L, 2nd semester)");
  } else {
    console.log("Found existing Course: LAW212");
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
    console.log("Created new draft QuestionBank for LAW212");
  } else {
    console.log(`Found existing QuestionBank for LAW212 (status: ${questionBank.status}) - will add/update questions in it`);
  }

  const dir = __dirname;
  const csvFiles = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("LAW212_CBT_Bank_Module") && f.endsWith(".csv"));

  if (csvFiles.length === 0) {
    console.log("\nNo LAW212_CBT_Bank_Module*.csv files found next to this script.");
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
  console.log(`Faculty of Law id: ${faculty.id}`);
  console.log(`Law department id: ${department.id}`);
  console.log(`\nNEXT STEP: run 'node crosslist-courses.js' so LAW212 also appears`);
  console.log(`for Criminology and Security Studies students (config update needed - see`);
  console.log(`the updated crosslist-courses.js provided alongside this script).`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("\nSeed script failed with an error:");
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

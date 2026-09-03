/**
 * seed-cit104.js
 *
 * Seeds CIT104 (Introduction to Computers) into the database.
 *
 * IMPORTANT - department: this script looks up the department by the
 * CONFIRMED live department ID for Computer Science, pulled directly
 * from Prisma Studio:
 *
 *   COMPUTER_SCIENCE: 'cmrcnngy20002100ylo7snl5m'
 *
 * NOTE - this is the FIRST course seeded into Computer Science since
 * CSC103 (the original Phase 1 demo course, which already has 3 real
 * question banks, 2 past question sets, and 18 recorded student
 * attempts). This script does NOT touch CSC103 in any way - it only
 * looks up the Computer Science department and creates CIT104 as a
 * separate, additional course. CSC103 is left completely alone,
 * pending a full Computer Science department build-out later.
 *
 * This script does NOT create the department if missing - it fails
 * loudly instead, since a missing department here would mean the
 * Computer Science department id has changed and needs to be
 * re-confirmed before writing any data.
 *
 * CIT104 is owned by Computer Science, and Faculty of Science is a
 * SEPARATE faculty from Faculty of Social Science - so unlike ECO121
 * and PCR111, CIT104 is NOT cross-listed into Criminology or any
 * Social Science department. Do not add a CIT104 entry to
 * crosslist-courses.js's CROSS_LISTINGS array.
 *
 * HOW TO RUN:
 *   cd C:\Users\HP\Desktop\ubora-world
 *   node prisma\seed-data\seed-cit104.js
 *
 * Place the 7 CIT104_CBT_Bank_Module1-7.csv files in the same folder
 * as this script (prisma\seed-data\) before running.
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

const COMPUTER_SCIENCE_DEPARTMENT_ID = "cmrcnngy20002100ylo7snl5m";

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
  console.log("=== CIT104 Seed Script: Starting ===\n");

  const department = await prisma.department.findUnique({
    where: { id: COMPUTER_SCIENCE_DEPARTMENT_ID },
  });
  if (!department) {
    console.error(`!!! STOPPING: Department with id '${COMPUTER_SCIENCE_DEPARTMENT_ID}' not found.`);
    console.error("This script deliberately does not auto-create the department.");
    console.error("The Computer Science department id may have changed - check the");
    console.error("database before proceeding, and update COMPUTER_SCIENCE_DEPARTMENT_ID if needed.");
    await prisma.$disconnect();
    process.exit(1);
  }
  console.log(`Found Department: ${department.name} (id: ${department.id})`);

  let course = await prisma.course.findUnique({ where: { code: "CIT104" } });
  if (!course) {
    course = await prisma.course.create({
      data: {
        code: "CIT104",
        title: "Introduction to Computers",
        departmentId: department.id,
        level: 100,
        semester: "second",
      },
    });
    console.log("Created Course: CIT104 - Introduction to Computers (100L, 2nd semester)");
  } else {
    console.log("Found existing Course: CIT104");
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
    console.log("Created new draft QuestionBank for CIT104");
  } else {
    console.log(`Found existing QuestionBank for CIT104 (status: ${questionBank.status}) - will add/update questions in it`);
  }

  const dir = __dirname;
  const csvFiles = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("CIT104_CBT_Bank_Module") && f.endsWith(".csv"));

  if (csvFiles.length === 0) {
    console.log("\nNo CIT104_CBT_Bank_Module*.csv files found next to this script.");
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
  console.log(`\nNOTE: CIT104 belongs to Faculty of Science, not Faculty of Social Science.`);
  console.log(`No cross-listing step is needed - do not run crosslist-courses.js for this course.`);
  console.log(`CSC103 (the original demo course) was not touched by this script.`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("\nSeed script failed with an error:");
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

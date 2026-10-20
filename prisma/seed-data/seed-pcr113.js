/**
 * seed-pcr113.js
 *
 * Seeds PCR113 (Introduction to Peace Education) into the database.
 *
 * Uses the confirmed live department ID for Peace and Conflict Resolution
 * (the same ID already used by seed-pcr111.js and crosslist-courses.js):
 *
 *   PEACE AND CONFLICT RESOLUTION: 'cms7arz16000csgby9l8g60gw'
 *   (confirmed live 29 Aug 2026)
 *
 * PCR113 is owned by the Peace and Conflict Resolution department (Faculty of
 * Social Sciences). It is NOT a GST course. Unlike PCR111/PCR114 it is NOT a
 * required course for Criminology, so it is NOT added to CROSS_LISTINGS. After
 * seeding, still run `node crosslist-courses.js` so the owning-department
 * CourseDepartment backfill row is created - that script must run even for
 * directly-owned courses.
 *
 * Course guide: PCR 113 Introduction to Peace Education, Department of Peace
 * Studies and Conflict Resolution, Faculty of Social Sciences. Course
 * Developer/Writer Dr. Joshua Olusegun Bolarinwa (Nigeria Institute of
 * International Affairs, Lagos); Course Editor Dr. Ms. Joan Mbagwu (C/o Olive
 * Branch Konsult, Lagos); Course Reviewer Dr. Olusola Matthew Ojo (Kampala
 * International University, Uganda); H.O.D. Iroye Samuel Opeyemi PhD. First
 * printed 2006, reviewed 2022, ISBN 978-058-889-2. Three-credit, one-semester
 * 100L course of 24 study units in 6 course-guide modules, grouped into 4 CBT
 * modules (25 questions each).
 *
 * HOW TO RUN:
 *   cd C:\Users\HP\Desktop\ubora-world
 *   node prisma\seed-data\seed-pcr113.js
 *   node crosslist-courses.js --dry-run
 *   node crosslist-courses.js
 *
 * Place all 4 PCR113_CBT_Bank_Module1-4.csv files in the same folder
 * as this script (prisma\seed-data\) before running.
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

const PCR_DEPARTMENT_ID = "cms7arz16000csgby9l8g60gw";

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
  console.log("=== PCR113 Seed Script: Starting ===\n");

  const department = await prisma.department.findUnique({
    where: { id: PCR_DEPARTMENT_ID },
  });
  if (!department) {
    console.error(`!!! STOPPING: Department with id '${PCR_DEPARTMENT_ID}' not found.`);
    console.error("This script deliberately does not auto-create the department.");
    await prisma.$disconnect();
    process.exit(1);
  }
  console.log(`Found Department: ${department.name} (id: ${department.id})`);

  let course = await prisma.course.findUnique({ where: { code: "PCR113" } });
  if (!course) {
    course = await prisma.course.create({
      data: {
        code: "PCR113",
        title: "Introduction to Peace Education",
        departmentId: department.id,
        level: 100,
        semester: "first",
      },
    });
    console.log("Created Course: PCR113 - Introduction to Peace Education (100L, 1st semester)");
  } else {
    console.log("Found existing Course: PCR113");
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
    console.log("Created new draft QuestionBank for PCR113");
  } else {
    console.log(`Found existing QuestionBank for PCR113 (status: ${questionBank.status}) - will add/update questions in it`);
  }

  const dir = __dirname;
  const csvFiles = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("PCR113_CBT_Bank_Module") && f.endsWith(".csv"));

  if (csvFiles.length === 0) {
    console.log("\nNo PCR113_CBT_Bank_Module*.csv files found next to this script.");
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
  console.log(`\nNEXT STEP: run 'node crosslist-courses.js' so PCR113 gets its`);
  console.log(`own-department CourseDepartment backfill. Do NOT add PCR113 to CROSS_LISTINGS`);
  console.log(`unless it is later taught outside Peace and Conflict Resolution.`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("\nSeed script failed with an error:");
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

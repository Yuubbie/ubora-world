/**
 * seed-pol223.js
 *
 * Seeds POL223 (Foundations of Political Economy) into the database.
 *
 * Owner: Department of Political Science, Faculty of Social Sciences,
 * National Open University of Nigeria. Confirmed live department ID:
 *
 *   POLITICAL SCIENCE: 'cms7arxwt0006sgbyf5hcu000'
 *
 * POL223 is a department-owned (non-GST) course. It is NOT added to
 * CROSS_LISTINGS. After seeding, run `node crosslist-courses.js` so the
 * owning-department CourseDepartment backfill row is created - that script
 * must run even for directly-owned courses.
 *
 * Level/semester: NOUN code convention - '2xx' marks 200 level and the
 * trailing '3' is treated as the first semester (consistent with the other
 * 2xx social-science courses already seeded). So POL223 is 200 level, first
 * semester.
 *
 * Course guide: POL 223 Foundations of Political Economy, National Open
 * University of Nigeria. Developer/Writer C. Nna-Emeka Okereke PhD (National
 * Defence College, Abuja); Editor Dr. Stella Akintola (University of Ibadan);
 * Programme Leader Prof. A. R. Yesufu (NOUN); Coordinator Abdul-Rahoof Adebayo
 * Bello (NOUN). First printed 2010, ISBN 978-058-104-9. Three-credit course
 * of 22 study units in 4 course-guide modules, grouped into 4 CBT modules
 * (25 questions each).
 *
 * HOW TO RUN:
 *   node prisma/seed-data/seed-pol223.js
 *   node crosslist-courses.js --dry-run
 *   node crosslist-courses.js
 *
 * Place all 4 POL223_CBT_Bank_Module*.csv files in the same folder as this
 * script (prisma/seed-data/) before running.
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

const POL_DEPARTMENT_ID = "cms7arxwt0006sgbyf5hcu000";

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
  console.log("=== POL223 Seed Script: Starting ===\n");

  const department = await prisma.department.findUnique({
    where: { id: POL_DEPARTMENT_ID },
  });
  if (!department) {
    console.error(`!!! STOPPING: Department with id '${POL_DEPARTMENT_ID}' not found.`);
    console.error("This script deliberately does not auto-create the department.");
    await prisma.$disconnect();
    process.exit(1);
  }
  console.log(`Found Department: ${department.name} (id: ${department.id})`);

  let course = await prisma.course.findUnique({ where: { code: "POL223" } });
  if (!course) {
    course = await prisma.course.create({
      data: {
        code: "POL223",
        title: "Foundations of Political Economy",
        departmentId: department.id,
        level: 200,
        semester: "first",
      },
    });
    console.log("Created Course: POL223 - Foundations of Political Economy (200L, 1st semester)");
  } else {
    console.log("Found existing Course: POL223");
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
    console.log("Created new draft QuestionBank for POL223");
  } else {
    console.log(`Found existing QuestionBank for POL223 (status: ${questionBank.status}) - will add/update questions in it`);
  }

  const dir = __dirname;
  const csvFiles = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("POL223_CBT_Bank_Module") && f.endsWith(".csv"));

  if (csvFiles.length === 0) {
    console.log("\nNo POL223_CBT_Bank_Module*.csv files found next to this script.");
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
  console.log(`\nNEXT STEP: run 'node crosslist-courses.js' so POL223 gets its`);
  console.log(`own-department CourseDepartment backfill. Do NOT add POL223 to CROSS_LISTINGS`);
  console.log(`unless it is later taught outside Political Science.`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("\nSeed script failed with an error:");
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

/**
 * seed-gst107.js
 *
 * Seeds GST107 (A Study Guide for the Distance Learner) into the database:
 * looks up/creates the Course (as a GST course - isGST: true, no
 * departmentId, so it appears across all Social Sciences departments via
 * the existing OR: [{ departmentId }, { isGST: true }] query pattern),
 * looks up/creates a single draft QuestionBank (same duplicate-bank guard
 * used in seed-css111.js), then reads all GST107_CBT_Bank_Module*.csv
 * files sitting next to this script and inserts/updates questions,
 * including the `module` field, in one pass.
 *
 * Adapted from the working seed-css111.js pattern - same CSV format,
 * same update-if-exists dedup logic, same admin user lookup. The only
 * structural difference is Course creation: GST courses use isGST: true
 * with no departmentId, rather than a department-specific course.
 *
 * HOW TO RUN:
 *   cd C:\Users\HP\Desktop\ubora-world
 *   node prisma\seed-data\seed-gst107.js
 *
 * Place the 4 GST107_CBT_Bank_Module1-4.csv files in the same folder
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
  console.log("=== GST107 Seed Script: Starting ===\n");

  let course = await prisma.course.findUnique({ where: { code: "GST107" } });
  if (!course) {
    course = await prisma.course.create({
      data: {
        code: "GST107",
        title: "A Study Guide for the Distance Learner",
        isGST: true,
        level: 100,
        semester: "first",
      },
    });
    console.log("Created Course: GST107 - A Study Guide for the Distance Learner (GST, 100L, 1st semester)");
  } else {
    console.log("Found existing Course: GST107");
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

  // Guard against duplicate QuestionBanks: always look up the single
  // earliest bank for this course, never create a second one.
  let questionBank = await prisma.questionBank.findFirst({
    where: { courseId: course.id },
    orderBy: { id: "asc" },
  });
  if (!questionBank) {
    questionBank = await prisma.questionBank.create({
      data: { courseId: course.id, status: "draft", createdBy: adminUser.id },
    });
    console.log("Created new draft QuestionBank for GST107");
  } else {
    console.log(`Found existing QuestionBank for GST107 (status: ${questionBank.status}) — will add/update questions in it`);
  }

  const dir = __dirname;
  const csvFiles = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("GST107_CBT_Bank_Module") && f.endsWith(".csv"));

  if (csvFiles.length === 0) {
    console.log("\nNo GST107_CBT_Bank_Module*.csv files found next to this script.");
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

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("\nSeed script failed with an error:");
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

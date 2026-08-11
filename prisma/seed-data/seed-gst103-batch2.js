/**
 * seed-gst103-batch2.js
 *
 * Adds Modules 4-6 questions to the EXISTING GST103 QuestionBank created
 * by seed-gst103.js (which already holds Modules 1-3). Does NOT create a
 * new course or a new QuestionBank - it looks up the existing draft bank
 * by courseId and adds to it, same update-if-exists dedup logic as the
 * original script.
 *
 * This completes GST103 (Computer Fundamentals): all 6 modules, 33 units,
 * 188 questions total once this batch runs (104 from session 1 + 84 here).
 *
 * HOW TO RUN:
 *   cd C:\Users\HP\Desktop\ubora-world
 *   node prisma\seed-data\seed-gst103-batch2.js
 *
 * Place the 3 GST103_CBT_Bank_Module4-6.csv files in the same folder
 * as this script (prisma\seed-data\) before running. Do NOT re-run
 * seed-gst103.js's Module 1-3 CSVs here - this script only reads
 * Module4/5/6 files.
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
  console.log("=== GST103 Seed Script (Batch 2: Modules 4-6) - Starting ===\n");

  const course = await prisma.course.findUnique({ where: { code: "GST103" } });
  if (!course) {
    console.error("GST103 course not found. Run seed-gst103.js first (Modules 1-3).");
    await prisma.$disconnect();
    process.exit(1);
  }
  console.log(`Found Course: GST103 - ${course.title}`);

  // Look up the EXISTING QuestionBank created in session 1 - do not create
  // a new one, to avoid the duplicate-bank issue CSS121 hit.
  const questionBank = await prisma.questionBank.findFirst({
    where: { courseId: course.id },
    orderBy: { id: "asc" },
  });
  if (!questionBank) {
    console.error("No existing QuestionBank found for GST103. Run seed-gst103.js first.");
    await prisma.$disconnect();
    process.exit(1);
  }
  console.log(`Found existing QuestionBank (id: ${questionBank.id}, status: ${questionBank.status}) — adding Modules 4-6 to it`);

  const dir = __dirname;
  const csvFiles = fs
    .readdirSync(dir)
    .filter((f) => /^GST103_CBT_Bank_Module[456]\.csv$/.test(f));

  if (csvFiles.length === 0) {
    console.log("\nNo GST103_CBT_Bank_Module4/5/6.csv files found next to this script.");
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

  const totalInBank = await prisma.question.count({ where: { questionBankId: questionBank.id } });

  console.log(`\n=== Batch 2 Seed Complete ===`);
  console.log(`Newly inserted (this run): ${totalInserted}`);
  console.log(`Updated (this run): ${totalUpdated}`);
  console.log(`Errors/skipped: ${totalErrors}`);
  console.log(`Question counts per module (this run):`, moduleCounts);
  console.log(`Total questions now in GST103's QuestionBank: ${totalInBank}`);
  console.log(`QuestionBank id: ${questionBank.id} (status: ${questionBank.status})`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("\nSeed script failed with an error:");
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

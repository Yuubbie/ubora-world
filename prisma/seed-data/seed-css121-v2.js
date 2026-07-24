/**
 * seed-css121.js  (v2 — now also writes/backfills the explanation field)
 *
 * Same as before, EXCEPT:
 *   - New questions now get their `explanation` column written in.
 *   - If a question with the same text already exists (e.g. the 71 we
 *     inserted earlier, before the explanation field existed), this script
 *     now UPDATES that existing row's explanation instead of skipping it.
 *     Nothing else about that existing row changes.
 *
 * Run this AFTER you've added `explanation String?` to schema.prisma and
 * applied it (via `npx prisma migrate dev` or `npx prisma db push`).
 *
 * HOW TO RUN (same as before):
 *   cd C:\Users\HP\Desktop\ubora-world
 *   node prisma\seed-data\seed-css121.js
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
  console.log("=== CSS121 Seed Script (v2): Starting ===\n");

  let faculty = await prisma.faculty.findUnique({ where: { name: "Social Sciences" } });
  if (!faculty) {
    faculty = await prisma.faculty.create({ data: { name: "Social Sciences" } });
    console.log("Created Faculty: Social Sciences");
  } else {
    console.log("Found existing Faculty: Social Sciences");
  }

  let department = await prisma.department.findFirst({
    where: { name: "Criminology & Security Studies", facultyId: faculty.id },
  });
  if (!department) {
    department = await prisma.department.create({
      data: { name: "Criminology & Security Studies", facultyId: faculty.id },
    });
    console.log("Created Department: Criminology & Security Studies");
  } else {
    console.log("Found existing Department: Criminology & Security Studies");
  }

  let course = await prisma.course.findUnique({ where: { code: "CSS121" } });
  if (!course) {
    course = await prisma.course.create({
      data: { code: "CSS121", title: "Introduction to Psychology", departmentId: department.id },
    });
    console.log("Created Course: CSS121 - Introduction to Psychology");
  } else {
    console.log("Found existing Course: CSS121");
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

  // Use the FIRST question bank for this course regardless of status, so we
  // keep adding to / updating the same bank rather than creating a second one.
  let questionBank = await prisma.questionBank.findFirst({
    where: { courseId: course.id },
    orderBy: { id: "asc" },
  });
  if (!questionBank) {
    questionBank = await prisma.questionBank.create({
      data: { courseId: course.id, status: "draft", createdBy: adminUser.id },
    });
    console.log("Created new draft QuestionBank for CSS121");
  } else {
    console.log(`Found existing QuestionBank for CSS121 (status: ${questionBank.status}) — will add/update questions in it`);
  }

  const dir = __dirname;
  const csvFiles = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("CSS121_CBT_Bank_Module") && f.endsWith(".csv"));

  if (csvFiles.length === 0) {
    console.log("\nNo CSS121_CBT_Bank_Module*.csv files found next to this script.");
    await prisma.$disconnect();
    return;
  }

  let totalInserted = 0;
  let totalUpdated = 0;
  let totalErrors = 0;

  for (const file of csvFiles) {
    const filePath = path.join(dir, file);
    console.log(`\nReading ${file} ...`);
    const questions = loadQuestionsFromCSV(filePath);

    for (const q of questions) {
      try {
        const options = [q.option_a, q.option_b, q.option_c, q.option_d].map((s) => (s || "").trim());
        const correctOptionIndex = letterToIndex(q.correct_option);
        const explanation = (q.explanation || "").trim() || null;

        const existing = await prisma.question.findFirst({
          where: { questionBankId: questionBank.id, text: q.question_text },
        });

        if (existing) {
          // Backfill/update the explanation (and keep options/correct index in sync
          // in case the CSV content was corrected since the last run).
          await prisma.question.update({
            where: { id: existing.id },
            data: { options, correctOptionIndex, explanation },
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
  console.log(`Updated (explanation backfilled): ${totalUpdated}`);
  console.log(`Errors/skipped: ${totalErrors}`);
  console.log(`QuestionBank id: ${questionBank.id} (status: ${questionBank.status})`);

  if (questionBank.status === "approved") {
    console.log(`\nThis bank is already approved and live — updates just applied are visible immediately.`);
  } else {
    console.log(`\nRemember: approve this bank in /admin/content before it's visible to students.`);
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("\nSeed script failed with an error:");
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

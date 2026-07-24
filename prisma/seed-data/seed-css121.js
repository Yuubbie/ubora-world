/**
 * seed-css121.js
 *
 * Seeds the CSS121 (Introduction to Psychology) course structure and CBT
 * question bank into the Ubora World database, using the real Prisma
 * schema (Faculty -> Department -> Course -> QuestionBank -> Question).
 *
 * WHAT THIS SCRIPT DOES, STEP BY STEP:
 *   1. Finds or creates the "Social Sciences" Faculty.
 *   2. Finds or creates the "Criminology & Security Studies" Department
 *      under that Faculty.
 *   3. Finds or creates the "CSS121" Course under that Department.
 *   4. Finds an existing admin (or super_admin) User to use as the
 *      QuestionBank's createdBy value. If none exists, the script stops
 *      and tells you exactly what to do — it will NOT invent a fake user.
 *   5. Creates one QuestionBank for CSS121 (status: draft, so nothing
 *      goes live until you approve it in the admin queue, per your
 *      existing content-approval rule).
 *   6. Reads every CSS121_CBT_Bank_Module*.csv file sitting next to this
 *      script and inserts each row as a Question, converting the
 *      correct_option letter (A-D) into correctOptionIndex (0-3) and the
 *      four option columns into the options String[] the schema expects.
 *
 * WHAT IT DELIBERATELY DOES NOT DO:
 *   - It does not write the "explanation", "module", "unit", or "tier"
 *     columns anywhere, because the Question model has no fields for
 *     them. Those columns stay in the CSV as your own reference/authoring
 *     material only.
 *   - It does not touch anything on the `main` branch's live data by
 *     itself — it runs against whatever DATABASE_URL is in your current
 *     .env file, so make sure that's pointed at the database you intend
 *     (see the run instructions below).
 *
 * HOW TO RUN THIS (Windows, Command Prompt):
 *   1. Copy this file AND all CSS121_CBT_Bank_Module*.csv files into:
 *        C:\Users\HP\Desktop\ubora-world\prisma\seed-data\
 *      (create the seed-data folder if it doesn't exist yet)
 *   2. Open Command Prompt.
 *   3. Run:
 *        cd C:\Users\HP\Desktop\ubora-world
 *        node prisma\seed-data\seed-css121.js
 *   4. Read the console output carefully — it tells you exactly what was
 *      created, what already existed, and (if it stops early) what you
 *      need to do before re-running it.
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

// Simple CSV parser that handles quoted fields containing commas.
// (No external package needed — keeps this script dependency-free.)
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
        // skip, \n handles the line break
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
  console.log("=== CSS121 Seed Script: Starting ===\n");

  // Step 1: Faculty
  let faculty = await prisma.faculty.findUnique({ where: { name: "Social Sciences" } });
  if (!faculty) {
    faculty = await prisma.faculty.create({ data: { name: "Social Sciences" } });
    console.log("Created Faculty: Social Sciences");
  } else {
    console.log("Found existing Faculty: Social Sciences");
  }

  // Step 2: Department
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

  // Step 3: Course
  let course = await prisma.course.findUnique({ where: { code: "CSS121" } });
  if (!course) {
    course = await prisma.course.create({
      data: {
        code: "CSS121",
        title: "Introduction to Psychology",
        departmentId: department.id,
      },
    });
    console.log("Created Course: CSS121 - Introduction to Psychology");
  } else {
    console.log("Found existing Course: CSS121");
  }

  // Step 4: Find an admin/super_admin user for createdBy
  const adminUser = await prisma.user.findFirst({
    where: { role: { in: ["admin", "super_admin"] } },
  });

  if (!adminUser) {
    console.log("\n!!! STOPPING: No admin or super_admin user was found in the database.");
    console.log("The QuestionBank.createdBy field needs a real User id.");
    console.log("Please log in to Ubora World once with your own admin account");
    console.log("(or create one), then re-run this script.");
    await prisma.$disconnect();
    process.exit(1);
  }
  console.log(`Using admin user as createdBy: ${adminUser.fullName} (${adminUser.id})`);

  // Step 5: QuestionBank (status: draft — goes through your normal approval queue)
  let questionBank = await prisma.questionBank.findFirst({
    where: { courseId: course.id, status: "draft" },
  });
  if (!questionBank) {
    questionBank = await prisma.questionBank.create({
      data: {
        courseId: course.id,
        status: "draft",
        createdBy: adminUser.id,
      },
    });
    console.log("Created new draft QuestionBank for CSS121");
  } else {
    console.log("Found existing draft QuestionBank for CSS121 — will add questions to it");
  }

  // Step 6: Load and insert questions from every matching CSV in this folder
  const dir = __dirname;
  const csvFiles = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("CSS121_CBT_Bank_Module") && f.endsWith(".csv"));

  if (csvFiles.length === 0) {
    console.log("\nNo CSS121_CBT_Bank_Module*.csv files found next to this script.");
    console.log("Make sure the CSV file(s) are in the same folder as seed-css121.js.");
    await prisma.$disconnect();
    return;
  }

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const file of csvFiles) {
    const filePath = path.join(dir, file);
    console.log(`\nReading ${file} ...`);
    const questions = loadQuestionsFromCSV(filePath);

    for (const q of questions) {
      try {
        const options = [q.option_a, q.option_b, q.option_c, q.option_d].map((s) => (s || "").trim());
        const correctOptionIndex = letterToIndex(q.correct_option);

        // Avoid inserting exact duplicate question text into the same bank
        const existing = await prisma.question.findFirst({
          where: { questionBankId: questionBank.id, text: q.question_text },
        });
        if (existing) {
          totalSkipped++;
          continue;
        }

        await prisma.question.create({
          data: {
            questionBankId: questionBank.id,
            text: q.question_text,
            options: options,
            correctOptionIndex: correctOptionIndex,
          },
        });
        totalInserted++;
      } catch (err) {
        console.log(`  Skipped a row due to error: ${err.message}`);
        totalSkipped++;
      }
    }
    console.log(`  Done with ${file}`);
  }

  console.log(`\n=== Seed Complete ===`);
  console.log(`Inserted: ${totalInserted} questions`);
  console.log(`Skipped (duplicates or errors): ${totalSkipped} questions`);
  console.log(`QuestionBank id: ${questionBank.id} (status: draft)`);
  console.log(`\nRemember: this QuestionBank is still in "draft" status.`);
  console.log(`Approve it through your normal admin content queue before it goes live to students.`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("\nSeed script failed with an error:");
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

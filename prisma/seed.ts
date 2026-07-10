import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SUBSCRIPTION_LENGTH_DAYS } from "../lib/config";

const db = new PrismaClient();

async function main() {
  const faculty = await db.faculty.upsert({
    where: { name: "Faculty of Sciences" },
    update: {},
    create: { name: "Faculty of Sciences" },
  });

  let department = await db.department.findFirst({
    where: { name: "Computer Science", facultyId: faculty.id },
  });
  if (!department) {
    department = await db.department.create({
      data: { name: "Computer Science", facultyId: faculty.id },
    });
  }

  const course = await db.course.upsert({
    where: { code: "CSC 103" },
    update: {},
    create: {
      code: "CSC 103",
      title: "Introduction to Computer Science",
      departmentId: department.id,
    },
  });

  const existingBank = await db.questionBank.findFirst({ where: { courseId: course.id } });
  if (!existingBank) {
    await db.questionBank.create({
      data: {
        courseId: course.id,
        status: "approved",
        createdBy: "seed",
        approvedBy: "seed",
        approvedAt: new Date(),
        questions: {
          create: [
            {
              text: "What does CPU stand for?",
              options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"],
              correctOptionIndex: 0,
            },
            {
              text: "Which of these is a high-level programming language?",
              options: ["Assembly", "Machine Code", "Python", "Binary"],
              correctOptionIndex: 2,
            },
            {
              text: "RAM is best described as:",
              options: ["Permanent storage", "Volatile memory", "An output device", "A type of software"],
              correctOptionIndex: 1,
            },
            {
              text: "Which unit measures data storage size, in increasing order?",
              options: ["GB, MB, KB, TB", "KB, MB, GB, TB", "TB, GB, MB, KB", "MB, GB, TB, KB"],
              correctOptionIndex: 1,
            },
            {
              text: "An algorithm is best defined as:",
              options: ["A programming language", "A step-by-step procedure to solve a problem", "A type of computer hardware", "An operating system"],
              correctOptionIndex: 1,
            },
          ],
        },
      },
    });
  }

  const existingSummary = await db.summary.findFirst({
    where: { courseId: course.id, title: "CSC 103 — Introduction to Computer Science" },
  });
  if (!existingSummary) {
    await db.summary.create({
      data: {
        courseId: course.id,
        title: "CSC 103 — Introduction to Computer Science",
        topicCount: 8,
        pageCount: 34,
        fileUrl: "https://example.com/placeholder-summary.pdf",
        status: "approved",
      },
    });
  }

  const existingPastQuestions = await db.pastQuestionSet.findFirst({ where: { courseId: course.id, year: 2024 } });
  if (!existingPastQuestions) {
    await db.pastQuestionSet.create({
      data: { courseId: course.id, year: 2024, status: "approved", fileUrl: "https://example.com/placeholder-pq.pdf" },
    });
  }

  const passwordHash = await bcrypt.hash("Password123!", 12);
  let student = await db.user.findFirst({
    where: { OR: [{ email: "demo.student@uboraworld.test" }, { email: "demo.student@uboraworldapp.com" }] },
  });
  if (!student) {
    student = await db.user.create({
      data: {
        fullName: "Demo Student",
        email: "demo.student@uboraworldapp.com",
        passwordHash,
        matricNumber: "NOU-2024-00001",
        role: "student",
      },
    });
  }

  const existingSub = await db.subscription.findFirst({ where: { userId: student.id, status: "active" } });
  if (!existingSub) {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + SUBSCRIPTION_LENGTH_DAYS * 24 * 60 * 60 * 1000);
    await db.subscription.create({
      data: { userId: student.id, tier: "standard", startDate, endDate, status: "active" },
    });
  }

  const adminPasswordHash = await bcrypt.hash("Admin123!", 12);
  await db.user.upsert({
    where: { email: "demo.admin@uboraworld.test" },
    update: {},
    create: {
      fullName: "Demo Admin",
      email: "demo.admin@uboraworld.test",
      passwordHash: adminPasswordHash,
      role: "admin",
    },
  });

  const existingDraftSummary = await db.summary.findFirst({
    where: { courseId: course.id, title: "CSC 103 — Supplementary Notes (draft)" },
  });
  if (!existingDraftSummary) {
    await db.summary.create({
      data: {
        courseId: course.id,
        title: "CSC 103 — Supplementary Notes (draft)",
        topicCount: 3,
        pageCount: 10,
        fileUrl: "https://example.com/placeholder-draft.pdf",
        status: "draft",
      },
    });
  }

  console.log("Seed complete (safe to re-run — every step now checks before creating).");
  console.log("Demo student login -> email: demo.student@uboraworldapp.com | password: Password123!");
  console.log("Demo admin login   -> email: demo.admin@uboraworld.test     | password: Admin123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => db.$disconnect());
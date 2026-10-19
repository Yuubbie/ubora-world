// app/api/tutor/chat/route.ts
//
// AI Tutor Chat endpoint — GEMINI VERSION (free tier).
//
// Same feature as before: a student sends a message about a specific
// course; this route grounds the AI's response in that course's own
// approved question bank (using each question's `explanation` field,
// already plain text and already fact-checked/grounded), then stores
// both the student's message and the assistant's reply so the
// conversation persists across page loads.
//
// WHY GEMINI INSTEAD OF CLAUDE: Google's Gemini API has a genuine,
// standing free tier (not a time-limited trial) suitable for a
// low-to-moderate volume feature like this. Anthropic's API has no
// free tier. Swap this back to Claude later if/when there's budget —
// the grounding logic, schema, and frontend component don't change at
// all, only the block marked "MODEL CALL" below.
//
// SECURITY: follows the exact same pattern as
// app/api/summaries/[summaryId]/route.ts — authenticate first, then
// gate by subscription tier server-side.
//
// SETUP REQUIRED:
//   1. Get a free API key from Google AI Studio (aistudio.google.com
//      → "Get API key"). No payment method needed for the free tier.
//   2. Add GEMINI_API_KEY to your .env
//   3. Run `npm install @google/genai`
//   4. Apply the schema changes in SCHEMA_CHANGES_tutor_chat.md first
//      — this route depends on the TutorChatMessage model.
//
// A NOTE ON THE FREE TIER'S LIMITS: free-tier Gemini access is
// rate-limited (requests per minute and per day, not unlimited), and
// its requests get lower priority than paid tier during Google's own
// server load — this shows up as occasional 503 "overloaded" errors
// even well within the rate limit, and can be sustained for longer
// stretches right after Google ships a new model everyone is testing
// at once. The retry + fallback-model logic below absorbs most of
// this. If you outgrow the free tier entirely, Google's own upgrade
// path is to add billing to the same project — no code change needed
// beyond simplifying this workaround if you want, since a paid tier
// gets priority and won't need it as much. Check ai.google.dev for
// the current free-tier model names and limits, since Google updates
// these periodically and a model name that works today could be
// renamed later.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireTier } from "@/lib/access";
import { db } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Primary model, plus a fallback used only if the primary keeps
// reporting 503 (overloaded) after retrying. "-latest" aliases tend
// to get hit hardest right after Google ships a new model — everyone
// testing the newest release at once — so a slightly older, more
// established model name is a reasonable fallback with likely lower
// contention. If Google renames/retires "gemini-2.0-flash" later,
// swap this constant the same way you'd update the primary one. Run
// this to see what's currently live on your key:
//   curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY"
const MODEL_PRIMARY = "gemini-flash-latest";
const MODEL_FALLBACK = "gemini-2.0-flash";

const MAX_GROUNDING_QUESTIONS = 60;
const MAX_HISTORY_MESSAGES = 20;

// Retries only on 503 (the model is temporarily overloaded on
// Google's end) — not on 400/401/404/etc, since those are real
// problems a retry won't fix and would just waste quota. Uses a
// short exponential backoff (500ms, then 1000ms) rather than
// retrying instantly, since an instant retry is unlikely to land on
// a moment when the model has freed up. Kept to one retry per model
// (rather than two) so trying two models back-to-back doesn't leave
// the student waiting too long overall.
async function generateWithRetry(
  params: Parameters<typeof genAI.models.generateContent>[0],
  maxRetries = 1
) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await genAI.models.generateContent(params);
    } catch (err: any) {
      lastError = err;
      const status = err?.status ?? err?.response?.status ?? err?.code;
      const isOverloaded = status === 503 || status === "503";
      if (!isOverloaded || attempt === maxRetries) throw err;
      const delayMs = 500 * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

// Tries the primary model first (with its own short retry above). If
// that's exhausted and the failure was specifically "overloaded",
// falls through to the fallback model once, rather than giving up on
// the whole request just because one specific model is busy right
// now.
async function generateWithFallback(
  baseParams: Omit<Parameters<typeof genAI.models.generateContent>[0], "model">
) {
  try {
    return await generateWithRetry({ ...baseParams, model: MODEL_PRIMARY });
  } catch (err: any) {
    const status = err?.status ?? err?.response?.status ?? err?.code;
    const isOverloaded = status === 503 || status === "503";
    if (!isOverloaded) throw err;
    console.warn(`Tutor chat: ${MODEL_PRIMARY} overloaded, falling back to ${MODEL_FALLBACK}`);
    return await generateWithRetry({ ...baseParams, model: MODEL_FALLBACK });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const gate = await requireTier(userId, "basic");
  if (!gate.ok) {
    return NextResponse.json({ error: "Subscription required" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const courseId = body?.courseId as string | undefined;
  const message = (body?.message as string | undefined)?.trim();

  if (!courseId || !message) {
    return NextResponse.json({ error: "courseId and message are required" }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: "Message is too long (max 2000 characters)" }, { status: 400 });
  }

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Ground the tutor in this course's own approved material — reusing
  // every explanation already written for this course's CBT questions.
  const questionBank = await db.questionBank.findFirst({
    where: { courseId, status: "approved" },
    include: {
      questions: {
        take: MAX_GROUNDING_QUESTIONS,
        select: { text: true, explanation: true },
      },
    },
  });

  const groundingMaterial = questionBank?.questions
    .filter((q) => q.explanation)
    .map((q, i) => `${i + 1}. ${q.explanation}`)
    .join("\n") || "";

  if (!groundingMaterial) {
    return NextResponse.json(
      { error: "This course does not have approved material yet — the tutor needs at least one approved question bank to ground its answers in." },
      { status: 404 }
    );
  }

  const priorMessages = await db.tutorChatMessage.findMany({
    where: { userId, courseId },
    orderBy: { createdAt: "desc" },
    take: MAX_HISTORY_MESSAGES,
  });
  priorMessages.reverse();

  const systemPrompt = `You are a patient, encouraging study tutor helping a Nigerian university student prepare for the course "${course.title}" (${course.code}).

Ground every factual claim in the reference material below, which is drawn directly from this course's own approved question bank. If the student asks something this material doesn't cover, say plainly that it's outside what you have for this course, rather than guessing or inventing a fact, date, case name, or statistic.

Teach, don't just answer. Where it helps learning, ask a short follow-up question to check understanding, rather than only delivering a wall of text. Keep replies concise — this is a chat interface, not an essay.

REFERENCE MATERIAL FOR THIS COURSE:
${groundingMaterial}`;

  // Gemini's chat-style API expects each turn tagged "user" or "model"
  // (not "assistant" like Claude/OpenAI) — mapped here so the rest of
  // the code, and the database, can keep using "assistant" everywhere
  // else for consistency with the rest of this app.
  const geminiHistory = [
    ...priorMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user" as const, parts: [{ text: message }] },
  ];

  let assistantReply: string;
  try {
    // ---- MODEL CALL (swap this block to change AI provider) ----
    const response = await generateWithFallback({
      contents: geminiHistory,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 1000,
      },
    });
    assistantReply = response.text?.trim() || "";
    // ---- end MODEL CALL ----

    if (!assistantReply) {
      throw new Error("Empty response from model");
    }
  } catch (err) {
    console.error("Tutor chat: Gemini API call failed", err);
    return NextResponse.json(
      { error: "Our tutor is a bit busy right now — please try again in a few seconds." },
      { status: 502 }
    );
  }

  await db.tutorChatMessage.createMany({
    data: [
      { userId, courseId, role: "user", content: message },
      { userId, courseId, role: "assistant", content: assistantReply },
    ],
  });

  return NextResponse.json({ reply: assistantReply });
}

// GET /api/tutor/chat?courseId=xxx — load conversation history and
// course info for the chat UI on page load.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const gate = await requireTier(userId, "basic");
  if (!gate.ok) {
    return NextResponse.json({ error: "Subscription required" }, { status: 403 });
  }

  const courseId = req.nextUrl.searchParams.get("courseId");
  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  const messages = await db.tutorChatMessage.findMany({
    where: { userId, courseId },
    orderBy: { createdAt: "asc" },
    select: { role: true, content: true, createdAt: true },
  });

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { title: true, code: true },
  });

  return NextResponse.json({ messages, course });
}
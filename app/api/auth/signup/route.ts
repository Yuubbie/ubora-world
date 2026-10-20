import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import { compactPhone, normalizeEmail } from "@/lib/identifiers";
import { grantPremiumTrial } from "@/lib/trial";

const emptyToUndef = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

const signupSchema = z.object({
  fullName: z.string().min(2),
  email: z.preprocess(emptyToUndef, z.string().email().optional()),
  phone: z.preprocess(emptyToUndef, z.string().min(7).optional()),
  password: z.string().min(8),
  matricNumber: z.preprocess(emptyToUndef, z.string().optional()),
}).refine((data) => data.email || data.phone, {
  message: "Provide an email or phone number",
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const fullName = parsed.data.fullName.trim();
  const email = parsed.data.email ? normalizeEmail(parsed.data.email) : undefined;
  const phone = parsed.data.phone ? compactPhone(parsed.data.phone) : undefined;
  const password = parsed.data.password;
  const matricNumber = parsed.data.matricNumber?.trim() || undefined;

  const existing = await db.user.findFirst({
    where: {
      OR: [
        ...(email ? [{ email: { equals: email, mode: "insensitive" as const } }] : []),
        ...(phone ? [{ phone }] : []),
        ...(matricNumber ? [{ matricNumber }] : []),
      ],
    },
  });
  if (existing) {
    return NextResponse.json({ error: "An account already exists with these details" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      fullName,
      email,
      phone,
      passwordHash,
      matricNumber,
      role: "student",
    },
  });

  await grantPremiumTrial(user.id);

  if (email) {
    sendWelcomeEmail(email, fullName).catch(() => {});
  }

  return NextResponse.json({
    id: user.id,
    fullName: user.fullName,
    trialDays: 10,
  }, { status: 201 });
}
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { TRIAL_LENGTH_DAYS, TRIAL_TIER } from "@/lib/config";

const signupSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().min(7).optional(),
  password: z.string().min(8),
  matricNumber: z.string().optional(),
}).refine((data) => data.email || data.phone, {
  message: "Provide an email or phone number",
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { fullName, email, phone, password, matricNumber } = parsed.data;

  const existing = await db.user.findFirst({
    where: { OR: [{ email }, { phone }, { matricNumber }] },
  });
  if (existing) {
    return NextResponse.json({ error: "An account already exists with these details" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + TRIAL_LENGTH_DAYS * 24 * 60 * 60 * 1000);

  // Public signup always creates a `student` role. Agent, content_partner, and
  // admin accounts are provisioned separately (Phase 2/3 admin tooling) — this
  // is what makes Spec 6.7 rule 1 (content partners can't hold referral codes)
  // structurally true rather than just a policy someone has to remember.
  // Launch trial: every new student gets 30 days of Premium (CBT, summaries,
  // Ask the Tutor) with no payment row. Paid checkout still creates a separate
  // subscription via confirmPaymentAndActivate.
  const user = await db.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { fullName, email, phone, passwordHash, matricNumber, role: "student" },
    });
    await tx.subscription.create({
      data: {
        userId: created.id,
        tier: TRIAL_TIER,
        startDate,
        endDate,
        status: "active",
      },
    });
    return created;
  });

  return NextResponse.json(
    { id: user.id, fullName: user.fullName, trialDays: TRIAL_LENGTH_DAYS, trialTier: TRIAL_TIER },
    { status: 201 },
  );
}

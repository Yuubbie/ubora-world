import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

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

  // Public signup always creates a `student` role. Agent, content_partner, and
  // admin accounts are provisioned separately (Phase 2/3 admin tooling) — this
  // is what makes Spec 6.7 rule 1 (content partners can't hold referral codes)
  // structurally true rather than just a policy someone has to remember.
  const user = await db.user.create({
    data: { fullName, email, phone, passwordHash, matricNumber, role: "student" },
  });

  return NextResponse.json({ id: user.id, fullName: user.fullName }, { status: 201 });
}

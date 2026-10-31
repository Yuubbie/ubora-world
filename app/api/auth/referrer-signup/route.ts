import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { ensureAgentForUser } from "@/lib/referral";

const emptyToUndef = (val: unknown) => (val === "" ? undefined : val);

const schema = z.object({
  fullName: z.string().min(2),
  email: z.preprocess(emptyToUndef, z.string().email().optional()),
  phone: z.preprocess(emptyToUndef, z.string().min(7).optional()),
  password: z.string().min(8),
}).refine((data) => data.email || data.phone, {
  message: "Provide an email or phone number",
});

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { fullName, email, phone, password } = parsed.data;
    const cleanEmail = email || null;
    const cleanPhone = phone || null;

    const orConditions = [];
    if (cleanEmail) orConditions.push({ email: cleanEmail });
    if (cleanPhone) orConditions.push({ phone: cleanPhone });

    if (orConditions.length > 0) {
      const existing = await db.user.findFirst({ where: { OR: orConditions } });
      if (existing) {
        if (cleanEmail && existing.email === cleanEmail) {
          return NextResponse.json({ error: "An account already exists with this email" }, { status: 409 });
        }
        if (cleanPhone && existing.phone === cleanPhone) {
          return NextResponse.json({ error: "An account already exists with this phone number" }, { status: 409 });
        }
        return NextResponse.json({ error: "An account already exists with these details" }, { status: 409 });
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: {
        fullName,
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        role: "agent",
      },
    });

    const agent = await ensureAgentForUser(user.id);
    return NextResponse.json({
      id: user.id,
      fullName: user.fullName,
      referralCode: agent.referralCode,
    }, { status: 201 });
  } catch (error) {
    console.error("Referrer signup error:", error);
    return NextResponse.json({ error: "Something went wrong during signup" }, { status: 500 });
  }
}

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

  // Public signup creates a `student` role safely matching your Prisma schema
  const user = await db.user.create({
    data: { 
      fullName, 
      email, 
      phone, 
      passwordHash, 
      matricNumber, 
      role: "student" 
    },
  });

  return NextResponse.json({ id: user.id, fullName: user.fullName }, { status: 201 });
}
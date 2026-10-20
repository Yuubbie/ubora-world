import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

// Helper to convert empty strings "" to undefined before validation
const emptyToUndef = (val: any) => (val === "" ? undefined : val);

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
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    
    const { fullName, email, phone, password, matricNumber } = parsed.data;

    const cleanEmail = email || null;
    const cleanPhone = phone || null;
    const cleanMatric = matricNumber || null;

    const orConditions = [];
    if (cleanEmail) orConditions.push({ email: cleanEmail });
    if (cleanPhone) orConditions.push({ phone: cleanPhone });
    if (cleanMatric) orConditions.push({ matricNumber: cleanMatric });

    if (orConditions.length > 0) {
      const existing = await db.user.findFirst({
        where: { OR: orConditions },
      });
      
      if (existing) {
        if (cleanEmail && existing.email === cleanEmail) {
          return NextResponse.json({ error: "An account already exists with this email" }, { status: 409 });
        }
        if (cleanPhone && existing.phone === cleanPhone) {
          return NextResponse.json({ error: "An account already exists with this phone number" }, { status: 409 });
        }
        if (cleanMatric && existing.matricNumber === cleanMatric) {
          return NextResponse.json({ error: "An account already exists with this matric number" }, { status: 409 });
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
        matricNumber: cleanMatric, 
        role: "student" 
      },
    });

    return NextResponse.json({ id: user.id, fullName: user.fullName }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Something went wrong during signup" }, { status: 500 });
  }
}
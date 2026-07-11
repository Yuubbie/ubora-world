import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const bodySchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  interest: z.enum(["noun", "waec_neco_jamb", "result_checker", "not_sure"]),
  referredBy: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.waitlistSignup.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    // Not an error from the user's point of view - just confirm they're on the list.
    return NextResponse.json({ ok: true, alreadyOnList: true });
  }

  await db.waitlistSignup.create({ data: parsed.data });
  return NextResponse.json({ ok: true, alreadyOnList: false });
}
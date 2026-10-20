import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { userLookupWhere } from "@/lib/identifiers";
import { createResetToken, genericForgotMessage, hashResetToken, RESET_TTL_MS, resetUrl } from "@/lib/passwordReset";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({
  identifier: z.string().trim().min(3).max(120),
});

const recentWindowMs = 15 * 60 * 1000;

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter the email or phone on your account." }, { status: 400 });
  }

  const identifier = parsed.data.identifier.trim();
  const user = await db.user.findFirst({
    where: userLookupWhere(identifier),
    select: { id: true, fullName: true, email: true, phone: true },
  });

  if (!user) {
    return NextResponse.json({ ok: true, message: genericForgotMessage() });
  }

  const recent = await db.passwordResetToken.count({
    where: { userId: user.id, createdAt: { gt: new Date(Date.now() - recentWindowMs) } },
  });
  if (recent >= 3) {
    return NextResponse.json({ ok: true, message: genericForgotMessage() });
  }

  const token = createResetToken();
  const tokenHash = hashResetToken(token);
  await db.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TTL_MS),
    },
  });

  const link = resetUrl(token);
  if (user.email) {
    await sendPasswordResetEmail(user.email, user.fullName, link).catch(() => {});
  }

  const thread = await db.inquiryThread.findFirst({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  const content = `PASSWORD RESET for ${user.fullName}${user.phone ? ` (${user.phone})` : ""}${user.email ? ` <${user.email}>` : ""}. Send this one-hour link on WhatsApp: ${link}`;
  if (thread) {
    await db.inquiryMessage.create({
      data: { threadId: thread.id, sender: "visitor", content },
    });
    await db.inquiryThread.update({ where: { id: thread.id }, data: { status: "open" } });
  } else {
    await db.inquiryThread.create({
      data: {
        userId: user.id,
        name: user.fullName,
        email: user.email,
        status: "open",
        messages: { create: { sender: "visitor", content } },
      },
    });
  }

  return NextResponse.json({ ok: true, message: genericForgotMessage() });
}

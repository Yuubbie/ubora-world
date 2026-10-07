import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

function requireAdmin(session: any) {
  const role = session?.user?.role;
  return session?.user && ["admin", "super_admin"].includes(role);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const threads = await db.inquiryThread.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      user: { select: { fullName: true, email: true } },
    },
  });

  return NextResponse.json({
    threads: threads.map((t) => ({
      id: t.id,
      status: t.status,
      name: t.name || t.user?.fullName || "Visitor",
      email: t.email || t.user?.email || null,
      signedIn: !!t.userId,
      updatedAt: t.updatedAt,
      preview: t.messages[t.messages.length - 1]?.content || "",
      messages: t.messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        content: m.content,
        createdAt: m.createdAt,
      })),
    })),
  });
}

const replySchema = z.object({
  threadId: z.string().min(1),
  message: z.string().trim().min(1).max(2000),
  close: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const parsed = replySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Reply cannot be empty." }, { status: 400 });
  }

  const adminId = (session!.user as any).id as string;
  const thread = await db.inquiryThread.findUnique({ where: { id: parsed.data.threadId } });
  if (!thread) return NextResponse.json({ error: "Thread not found." }, { status: 404 });

  await db.inquiryMessage.create({
    data: {
      threadId: thread.id,
      sender: "admin",
      content: parsed.data.message,
      adminId,
    },
  });

  await db.inquiryThread.update({
    where: { id: thread.id },
    data: { status: parsed.data.close ? "closed" : "open" },
  });

  const messages = await db.inquiryMessage.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    ok: true,
    messages: messages.map((m) => ({
      id: m.id,
      sender: m.sender,
      content: m.content,
      createdAt: m.createdAt,
    })),
  });
}

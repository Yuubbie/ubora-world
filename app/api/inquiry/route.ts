import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const postSchema = z.object({
  visitorKey: z.string().min(8).max(80).optional(),
  name: z.string().trim().max(80).optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  message: z.string().trim().min(1).max(2000),
});

function cookieKey(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)ubora_inquiry=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function setVisitorCookie(res: NextResponse, key: string) {
  res.cookies.set("ubora_inquiry", key, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const visitorKey = cookieKey(req);

  const thread = userId
    ? await db.inquiryThread.findFirst({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      })
    : visitorKey
      ? await db.inquiryThread.findUnique({
          where: { visitorKey },
          include: { messages: { orderBy: { createdAt: "asc" } } },
        })
      : null;

  if (!thread) {
    return NextResponse.json({ thread: null, messages: [] });
  }

  return NextResponse.json({
    thread: {
      id: thread.id,
      status: thread.status,
      name: thread.name,
      email: thread.email,
    },
    messages: thread.messages.map((m) => ({
      id: m.id,
      sender: m.sender,
      content: m.content,
      createdAt: m.createdAt,
    })),
  });
}

export async function POST(req: Request) {
  const parsed = postSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Write a short message so we can help." }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const userName = session?.user?.name || null;
  const userEmail = session?.user?.email || null;

  let visitorKey = cookieKey(req);
  if (!userId && !visitorKey) {
    visitorKey = parsed.data.visitorKey || crypto.randomUUID();
  }

  const existing = userId
    ? await db.inquiryThread.findFirst({ where: { userId }, orderBy: { updatedAt: "desc" } })
    : visitorKey
      ? await db.inquiryThread.findUnique({ where: { visitorKey } })
      : null;

  const name = (parsed.data.name || userName || existing?.name || "").trim() || null;
  const email = (parsed.data.email || userEmail || existing?.email || "").trim() || null;

  const thread = existing
    ? await db.inquiryThread.update({
        where: { id: existing.id },
        data: { name, email, status: "open" },
      })
    : await db.inquiryThread.create({
        data: {
          visitorKey: userId ? null : visitorKey,
          userId: userId || null,
          name,
          email,
          status: "open",
        },
      });

  await db.inquiryMessage.create({
    data: {
      threadId: thread.id,
      sender: "visitor",
      content: parsed.data.message,
    },
  });

  const messages = await db.inquiryMessage.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "asc" },
  });

  const res = NextResponse.json({
    thread: { id: thread.id, status: thread.status, name: thread.name, email: thread.email },
    messages: messages.map((m) => ({
      id: m.id,
      sender: m.sender,
      content: m.content,
      createdAt: m.createdAt,
    })),
  });
  if (!userId && visitorKey) setVisitorCookie(res, visitorKey);
  return res;
}

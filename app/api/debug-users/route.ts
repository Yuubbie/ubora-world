import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// TEMPORARY DIAGNOSTIC ROUTE — delete this file once the preview-login
// investigation is finished. It reveals no passwords or secrets, only
// counts and whether a specific email exists, to compare Preview vs
// Production database contents.
export async function GET() {
  try {
    const totalUsers = await db.user.count();
    const demoUser = await db.user.findFirst({
      where: { email: "demo.student@uboraworld.test" },
      select: { id: true, email: true, fullName: true, role: true },
    });

    return NextResponse.json({
      environment: process.env.VERCEL_ENV ?? "unknown",
      totalUsers,
      demoUserFound: !!demoUser,
      demoUser: demoUser ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "db_query_failed", message: (err as Error).message },
      { status: 500 }
    );
  }
}

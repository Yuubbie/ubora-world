import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// TEMPORARY DIAGNOSTIC ROUTE — delete once the login investigation is done.
// Lists existing accounts' emails/roles only — no passwords or secrets.
export async function GET() {
  try {
    const users = await db.user.findMany({
      select: { email: true, phone: true, fullName: true, role: true },
    });

    return NextResponse.json({
      environment: process.env.VERCEL_ENV ?? "unknown",
      totalUsers: users.length,
      users,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "db_query_failed", message: (err as Error).message },
      { status: 500 }
    );
  }
}

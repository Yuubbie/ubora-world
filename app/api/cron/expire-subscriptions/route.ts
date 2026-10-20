import { NextResponse } from "next/server";
import { expirePastDueSubscriptions } from "@/lib/expireSubscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const expired = await expirePastDueSubscriptions();
  return NextResponse.json({ expired });
}

export async function POST(req: Request) {
  return GET(req);
}

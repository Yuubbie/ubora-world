import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureAgentForUser, releaseMaturedCommissions } from "@/lib/referral";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  await releaseMaturedCommissions();
  const agent = await ensureAgentForUser(userId);

  const payable = await db.commission.findMany({
    where: { agentId: agent.id, status: "payable", payoutId: null },
    select: { id: true, amount: true },
  });

  const amount = payable.reduce((sum, row) => sum + row.amount, 0);
  if (amount <= 0) {
    return NextResponse.json({ error: "nothing_payable" }, { status: 400 });
  }

  const payout = await db.$transaction(async (tx) => {
    const created = await tx.payout.create({
      data: { agentId: agent.id, amount, status: "requested" },
    });
    await tx.commission.updateMany({
      where: { id: { in: payable.map((row) => row.id) } },
      data: { payoutId: created.id },
    });
    return created;
  });

  return NextResponse.json({ id: payout.id, amount: payout.amount });
}

import { randomBytes } from "crypto";
import type { Prisma, PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";
import { REFERRAL_PAYABLE_AFTER_DAYS, referralRewardForAmount } from "@/lib/config";
import { SITE_URL } from "@/lib/seo";

type DbClient = PrismaClient | Prisma.TransactionClient;

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeReferralCode(raw: string | null | undefined) {
  if (!raw) return null;
  let value = raw.trim();
  try {
    if (/^https?:\/\//i.test(value) || value.includes("uboraworld.com.ng")) {
      const url = new URL(value.startsWith("http") ? value : `https://${value}`);
      value = url.searchParams.get("ref") || value;
    }
  } catch {
    const fromQuery = value.match(/[?&]ref=([A-Za-z0-9]+)/i);
    if (fromQuery) value = fromQuery[1];
  }
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return cleaned.length >= 4 && cleaned.length <= 16 ? cleaned : null;
}

export function referralSignupUrl(code: string) {
  return `${SITE_URL}/signup?ref=${encodeURIComponent(code)}`;
}

function randomCode() {
  const bytes = randomBytes(6);
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return code;
}

export async function ensureAgentForUser(userId: string, client: DbClient = db) {
  const existing = await client.agent.findUnique({ where: { userId } });
  if (existing) return existing;

  for (let attempt = 0; attempt < 8; attempt++) {
    const referralCode = randomCode();
    try {
      return await client.agent.create({
        data: { userId, referralCode, commissionRate: 0 },
      });
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code !== "P2002") throw error;
    }
  }

  throw new Error("Could not allocate a referral code.");
}

export async function attachReferralOnSignup(params: {
  referredUserId: string;
  referralCode: string | null | undefined;
  client?: DbClient;
}) {
  const code = normalizeReferralCode(params.referralCode);
  if (!code) return null;
  const client = params.client ?? db;

  const agent = await client.agent.findUnique({ where: { referralCode: code } });
  if (!agent) return null;
  if (agent.userId === params.referredUserId) return null;

  const alreadyReferred = await client.referral.findUnique({
    where: { referredUserId: params.referredUserId },
  });
  if (alreadyReferred) return alreadyReferred;

  try {
    return await client.referral.create({
      data: { agentId: agent.id, referredUserId: params.referredUserId },
    });
  } catch (error) {
    const prismaCode = (error as { code?: string }).code;
    if (prismaCode === "P2002") {
      return client.referral.findUnique({
        where: { referredUserId: params.referredUserId },
      });
    }
    throw error;
  }
}

export async function creditReferralOnFirstPayment(userId: string, amountKobo: number, client: DbClient = db) {
  const rewardKobo = referralRewardForAmount(amountKobo);
  if (rewardKobo == null) return null;

  const referral = await client.referral.findUnique({
    where: { referredUserId: userId },
    include: { commission: true },
  });
  if (!referral || referral.commission) return null;

  const payableAfter = new Date();
  payableAfter.setUTCDate(payableAfter.getUTCDate() + REFERRAL_PAYABLE_AFTER_DAYS);

  try {
    return await client.commission.create({
      data: {
        agentId: referral.agentId,
        referralId: referral.id,
        amount: rewardKobo,
        status: "pending",
        payableAfter,
      },
    });
  } catch (error) {
    const prismaCode = (error as { code?: string }).code;
    if (prismaCode === "P2002") return null;
    throw error;
  }
}

export async function releaseMaturedCommissions(client: DbClient = db) {
  const result = await client.commission.updateMany({
    where: {
      status: "pending",
      payableAfter: { lte: new Date() },
    },
    data: { status: "payable" },
  });
  return result.count;
}

export function nairaFromKobo(kobo: number) {
  return Math.round(kobo / 100);
}

export function formatNaira(kobo: number) {
  return `₦${nairaFromKobo(kobo).toLocaleString("en-NG")}`;
}

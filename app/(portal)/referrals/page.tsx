import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAccessState } from "@/lib/access";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";
import CopyButton from "@/components/CopyButton";
import { db } from "@/lib/db";
import { ENQUIRY_NUMBER } from "@/lib/config";
import {
  ensureAgentForUser,
  formatNaira,
  referralSignupUrl,
  releaseMaturedCommissions,
} from "@/lib/referral";
import RequestPayoutButton from "./RequestPayoutButton";

export const dynamic = "force-dynamic";

function statusLabel(status: string, hasPayment: boolean) {
  if (status === "paid") return "Paid";
  if (status === "payable") return "Ready";
  if (status === "pending") return "Waiting 7 days";
  if (status === "voided") return "Voided";
  if (!hasPayment) return "Signed up — unpaid";
  return "Processing";
}

export default async function ReferralsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as { id: string }).id;
  const role = (session!.user as { role?: string }).role;
  const access = role === "agent" ? { active: false as const, tier: null } : await getAccessState(userId);

  await releaseMaturedCommissions();
  const agent = await ensureAgentForUser(userId);
  const shareUrl = referralSignupUrl(agent.referralCode);

  const referrals = await db.referral.findMany({
    where: { agentId: agent.id },
    orderBy: { createdAt: "desc" },
    include: {
      commission: { select: { amount: true, status: true } },
      referredUser: { select: { id: true, fullName: true } },
    },
  });
  const successPayments = await db.payment.findMany({
    where: {
      status: "success",
      userId: { in: referrals.map((row) => row.referredUserId) },
    },
    select: { userId: true, amount: true },
  });
  const paidUserIds = new Set(successPayments.map((row) => row.userId));

  const commissions = await db.commission.findMany({
    where: { agentId: agent.id },
    select: { amount: true, status: true, payoutId: true },
  });
  const payouts = await db.payout.findMany({
    where: { agentId: agent.id },
    orderBy: { requestedAt: "desc" },
    take: 8,
  });

  const earned = commissions.reduce((sum, row) => sum + (row.status === "voided" ? 0 : row.amount), 0);
  const pending = commissions.filter((row) => row.status === "pending").reduce((sum, row) => sum + row.amount, 0);
  const payable = commissions
    .filter((row) => row.status === "payable" && !row.payoutId)
    .reduce((sum, row) => sum + row.amount, 0);
  const paidOut = commissions.filter((row) => row.status === "paid").reduce((sum, row) => sum + row.amount, 0);
  const paidCount = referrals.filter((row) => Boolean(row.commission)).length;

  return (
    <div className="md:flex md:min-h-screen">
      <PortalNav tier={access.active ? access.tier : null} userName={session!.user?.name || undefined} />
      <div className="flex-1 bg-dot-grid min-h-screen">
        <div className="page-shell">
          <PageHeader
            eyebrow="Referrals"
            title="Earn ₦500 / ₦1,000"
            subtitle="Share your link. You earn ₦500 when a friend pays monthly, or ₦1,000 when they take a semester plan. Free trials do not count. Anyone can refer — students and non-students."
          />

          <div className="card-static p-6 md:p-8 mb-6">
            <p className="eyebrow text-golddeep mb-2">Your link</p>
            <p className="font-display text-2xl font-bold tracking-tight mb-1">{agent.referralCode}</p>
            <p className="text-sm text-muted break-all mb-4">{shareUrl}</p>
            <div className="flex flex-wrap gap-2">
              <CopyButton value={shareUrl} label="Copy link" />
              <CopyButton value={agent.referralCode} label="Copy code" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="stat-card">
              <div className="stat-number">{referrals.length}</div>
              <div className="stat-label">Invited</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{paidCount}</div>
              <div className="stat-label">Paid friends</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{formatNaira(earned)}</div>
              <div className="stat-label">Earned</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{formatNaira(payable)}</div>
              <div className="stat-label">Ready to request</div>
            </div>
          </div>

          <section className="card-static p-6 md:p-8 mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <div>
                <p className="eyebrow text-golddeep mb-2">Payout</p>
                <h2 className="type-section-title">Request what is ready</h2>
                <p className="text-sm text-muted mt-2">
                  {formatNaira(pending)} waiting 7 days. {formatNaira(paidOut)} already paid. WhatsApp {ENQUIRY_NUMBER} if a payout is late.
                </p>
              </div>
              <RequestPayoutButton disabled={payable <= 0} />
            </div>
            {payouts.length === 0 ? (
              <p className="text-sm text-muted">No payout requests yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {payouts.map((payout) => (
                  <li key={payout.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-medium">{formatNaira(payout.amount)}</p>
                      <p className="text-xs text-muted">
                        {new Date(payout.requestedAt).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <span className="tag">{payout.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card-static p-6 md:p-8">
            <p className="eyebrow text-golddeep mb-2">Friends</p>
            <h2 className="type-section-title mb-6">Who used your link</h2>
            {referrals.length === 0 ? (
              <p className="text-sm text-muted">No referrals yet. Share the link above.</p>
            ) : (
              <ul className="divide-y divide-line">
                {referrals.map((row) => {
                  const paid = paidUserIds.has(row.referredUserId);
                  return (
                    <li key={row.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{row.referredUser.fullName}</p>
                        <p className="text-xs text-muted">
                          {new Date(row.createdAt).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                      <span className="tag shrink-0">
                        {statusLabel(row.commission?.status || "", paid)}
                        {row.commission ? ` · ${formatNaira(row.commission.amount)}` : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

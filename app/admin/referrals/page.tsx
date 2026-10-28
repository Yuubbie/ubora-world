import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatNaira, releaseMaturedCommissions } from "@/lib/referral";
import MarkPayoutButton from "./MarkPayoutButton";

export const dynamic = "force-dynamic";

export default async function AdminReferralsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    redirect("/login");
  }

  await releaseMaturedCommissions();
  const canPay = session.user.email === "yubbiepen.pixel@gmail.com";

  const [agents, payouts, commissions] = await Promise.all([
    db.agent.findMany({
      include: {
        user: { select: { fullName: true, email: true } },
        _count: { select: { referrals: true } },
      },
      orderBy: { referrals: { _count: "desc" } },
    }),
    db.payout.findMany({
      orderBy: { requestedAt: "desc" },
      include: {
        agent: { include: { user: { select: { fullName: true, email: true, phone: true } } } },
      },
    }),
    db.commission.findMany({ select: { amount: true, status: true } }),
  ]);

  const pending = commissions.filter((row) => row.status === "pending").reduce((sum, row) => sum + row.amount, 0);
  const payable = commissions.filter((row) => row.status === "payable").reduce((sum, row) => sum + row.amount, 0);
  const paid = commissions.filter((row) => row.status === "paid").reduce((sum, row) => sum + row.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-gray-900 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <a href="/admin" className="text-sm text-gray-500 hover:text-[#101B33]">Back to admin</a>
            <h1 className="text-3xl font-bold text-[#101B33] mt-2">Referrals</h1>
            <p className="text-gray-500 mt-1">₦500 monthly or ₦1,000 semester on a friend's first paid plan. Trials do not earn.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Waiting 7 days</p>
            <h3 className="text-3xl font-extrabold text-[#101B33] mt-2">{formatNaira(pending)}</h3>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Ready / requested</p>
            <h3 className="text-3xl font-extrabold text-[#C79A3D] mt-2">{formatNaira(payable)}</h3>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Paid out</p>
            <h3 className="text-3xl font-extrabold text-green-600 mt-2">{formatNaira(paid)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-[#101B33]">Payout requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-100/75 border-b border-gray-200 text-gray-600 font-semibold">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Requested</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payouts.map((payout) => (
                  <tr key={payout.id}>
                    <td className="px-6 py-4">
                      <p className="font-medium">{payout.agent.user.fullName}</p>
                      <p className="text-xs text-gray-500">{payout.agent.user.email || payout.agent.user.phone || "—"}</p>
                    </td>
                    <td className="px-6 py-4">{formatNaira(payout.amount)}</td>
                    <td className="px-6 py-4 uppercase">{payout.status}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(payout.requestedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      {canPay && payout.status !== "paid" ? (
                        <div className="flex justify-end gap-2">
                          {payout.status === "requested" ? (
                            <MarkPayoutButton payoutId={payout.id} action="processing" label="Mark processing" />
                          ) : null}
                          <MarkPayoutButton payoutId={payout.id} action="paid" label="Mark paid" />
                        </div>
                      ) : payout.status === "paid" ? (
                        <span className="text-gray-400 text-xs uppercase font-semibold">Paid</span>
                      ) : (
                        <span className="text-gray-400 text-xs italic">View-Only</span>
                      )}
                    </td>
                  </tr>
                ))}
                {payouts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No payout requests yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-[#101B33]">Agents</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-100/75 border-b border-gray-200 text-gray-600 font-semibold">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Invites</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {agents.map((agent) => (
                  <tr key={agent.id}>
                    <td className="px-6 py-4">
                      <p className="font-medium">{agent.user.fullName}</p>
                      <p className="text-xs text-gray-500">{agent.user.email || "—"}</p>
                    </td>
                    <td className="px-6 py-4 font-mono">{agent.referralCode}</td>
                    <td className="px-6 py-4">{agent._count.referrals}</td>
                  </tr>
                ))}
                {agents.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No referral codes issued yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

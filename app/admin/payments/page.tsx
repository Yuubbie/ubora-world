import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatKoboNaira } from "@/lib/paystackFees";
import ReconcileForm from "./ReconcileForm";
import ReconcileButton from "./ReconcileButton";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    redirect("/login");
  }

  const payments = await db.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    include: {
      subscription: { select: { id: true, status: true, tier: true, endDate: true } },
    },
  });

  const userIds = [...new Set(payments.map((payment) => payment.userId))];
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, fullName: true, email: true, phone: true },
  });
  const userById = new Map(users.map((user) => [user.id, user]));

  const stuck = payments.filter((payment) => payment.status !== "success" || !payment.subscription);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-gray-900 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <a href="/admin" className="text-sm text-gray-500 hover:text-[#101B33]">Back to admin</a>
            <h1 className="text-3xl font-bold text-[#101B33] mt-2">Payments</h1>
            <p className="text-gray-500 mt-1">
              Paystack can succeed while Ubora still shows pending if the webhook or callback never confirmed. Grant access here with the Paystack reference.
            </p>
          </div>
        </div>

        <ReconcileForm />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-[#101B33]">Needs attention ({stuck.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-100/75 border-b border-gray-200 text-gray-600 font-semibold">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">When</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stuck.map((payment) => {
                  const user = userById.get(payment.userId);
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium">{user?.fullName ?? payment.userId}</div>
                        <div className="text-gray-500">{user?.email || user?.phone || "—"}</div>
                      </td>
                      <td className="px-6 py-4">{formatKoboNaira(payment.amount)}</td>
                      <td className="px-6 py-4 uppercase">{payment.status}</td>
                      <td className="px-6 py-4 font-mono text-xs">{payment.reference}</td>
                      <td className="px-6 py-4 text-gray-500">{payment.createdAt.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <ReconcileButton reference={payment.reference} />
                      </td>
                    </tr>
                  );
                })}
                {stuck.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No stuck payments. Successful Paystack charges should appear as paid subscribers.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-[#101B33]">Recent payments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-100/75 border-b border-gray-200 text-gray-600 font-semibold">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Access</th>
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => {
                  const user = userById.get(payment.userId);
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium">{user?.fullName ?? payment.userId}</div>
                        <div className="text-gray-500">{user?.email || user?.phone || "—"}</div>
                      </td>
                      <td className="px-6 py-4">{formatKoboNaira(payment.amount)}</td>
                      <td className="px-6 py-4 uppercase">{payment.status}</td>
                      <td className="px-6 py-4">
                        {payment.subscription
                          ? `${payment.subscription.tier} / ${payment.subscription.status}`
                          : "none"}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{payment.reference}</td>
                      <td className="px-6 py-4 text-gray-500">{payment.createdAt.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

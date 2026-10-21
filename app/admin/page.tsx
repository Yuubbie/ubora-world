import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import DeleteButton from "./DeleteButton";
import { isPaidSubscription, isRealStudent } from "@/lib/adminStats";
import { deleteUserAndRelated } from "@/lib/deleteUser";
import { expirePastDueSubscriptions } from "@/lib/expireSubscriptions";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  await expirePastDueSubscriptions();

  const currentUserEmail = session.user.email;
  const canDelete = currentUserEmail === "yubbiepen.pixel@gmail.com";

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscriptions: {
        orderBy: { endDate: "desc" },
        include: { payment: true },
        take: 1,
      },
    },
  });

  const now = new Date();
  const paidSubscribers = users.filter((user) => {
    if (!isRealStudent(user)) return false;
    const sub = user.subscriptions[0];
    return isPaidSubscription(sub) && sub.status === "active" && sub.endDate >= now;
  });
  const totalSubscribersCount = paidSubscribers.length;

  const successPayments = await db.payment.findMany({
    where: { status: "success" },
    select: { amount: true, userId: true },
  });
  const payerIds = [...new Set(successPayments.map((payment) => payment.userId))];
  const payers = await db.user.findMany({
    where: { id: { in: payerIds } },
    select: { id: true, email: true, role: true },
  });
  const payerById = new Map(payers.map((payer) => [payer.id, payer]));
  const totalSubRevenue =
    successPayments
      .filter((payment) => {
        const payer = payerById.get(payment.userId);
        return Boolean(payer && isRealStudent(payer));
      })
      .reduce((sum, payment) => sum + payment.amount, 0) / 100;

  async function deleteUser(formData: FormData) {
    "use server";

    const currentSession = await getServerSession(authOptions);
    if (!currentSession?.user || (currentSession.user as any).role !== "admin" || currentSession.user.email !== "yubbiepen.pixel@gmail.com") {
      throw new Error("Unauthorized action. Only the Master Admin can delete users.");
    }

    const userId = formData.get("userId") as string;
    if (!userId) return;

    try {
      await deleteUserAndRelated(userId);
      revalidatePath("/admin");
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-gray-900 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#101B33]">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage users, view subscriber statistics, and assess platforms.</p>
          </div>
          <div className="bg-[#101B33] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
            Admin Session: {session.user.name} ({canDelete ? "Master Admin" : "View-Only"})
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Users</p>
            <h3 className="text-3xl font-extrabold text-[#101B33] mt-2">{users.length}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Subscribers (Paid)</p>
            <h3 className="text-3xl font-extrabold text-[#C79A3D] mt-2">{totalSubscribersCount}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-3xl font-extrabold text-green-600 mt-2">₦{totalSubRevenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-100/75 border-b border-gray-200 text-gray-600 font-semibold">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Plan & Role</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => {
                  const sub = user.subscriptions[0];
                  const hasSub = Boolean(sub);
                  const isPaid = isPaidSubscription(sub);
                  const trialExpired = hasSub && !isPaid && sub.endDate < now;

                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.fullName}</td>
                      <td className="px-6 py-4 text-gray-600">{user.email || "—"}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
                          user.role === "admin" ? "bg-[#C79A3D]/20 text-[#8C6D1F]" : "bg-gray-100 text-gray-800"
                        }`}>
                          {user.role}
                        </span>
                        {hasSub && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${
                            isPaid ? "bg-green-100 text-green-800" : trialExpired ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-800"
                          }`}>
                            {isPaid ? sub.tier : trialExpired ? "EXPIRED" : "TRIAL"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.role !== "admin" && canDelete ? (
                          <DeleteButton userId={user.id} deleteAction={deleteUser} />
                        ) : user.role === "admin" ? (
                          <span className="text-gray-400 text-xs uppercase font-semibold">Protected</span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">View-Only</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No users found.
                    </td>
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

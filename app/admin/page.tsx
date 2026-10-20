import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import DeleteButton from "./DeleteButton";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/login"); 
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  async function deleteUser(formData: FormData) {
    "use server";
    
    const currentSession = await getServerSession(authOptions);
    if (!currentSession?.user || (currentSession.user as any).role !== "admin") {
      throw new Error("Unauthorized access");
    }

    const userId = formData.get("userId") as string;
    if (!userId) return;

    try {
      await db.passwordResetToken.deleteMany({ where: { userId } });
      
      const threads = await db.inquiryThread.findMany({ where: { userId } });
      if (threads.length > 0) {
        const threadIds = threads.map(t => t.id);
        await db.inquiryMessage.deleteMany({ where: { threadId: { in: threadIds } } });
        await db.inquiryThread.deleteMany({ where: { userId } });
      }
      
      await db.user.delete({ where: { id: userId } });
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
            <p className="text-gray-500 mt-1">Manage users and platform access.</p>
          </div>
          <div className="bg-[#101B33] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
            Admin: {(session.user as any).name}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-100/75 border-b border-gray-200 text-gray-600 font-semibold">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{user.fullName}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email || "—"}</td>
                    <td className="px-6 py-4 text-gray-600">{user.phone || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-[#C79A3D]/20 text-[#8C6D1F]' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== "admin" ? (
                        <DeleteButton userId={user.id} deleteAction={deleteUser} />
                      ) : (
                        <span className="text-gray-400 text-xs uppercase font-semibold">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
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
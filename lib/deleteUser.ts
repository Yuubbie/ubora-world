import { db } from "@/lib/db";

export async function deleteUserAndRelated(userId: string) {
  await db.$transaction(async (tx) => {
    const target = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!target || target.role === "admin") {
      throw new Error("User cannot be deleted.");
    }

    await tx.passwordResetToken.deleteMany({ where: { userId } });
    await tx.tutorChatMessage.deleteMany({ where: { userId } });
    await tx.attempt.deleteMany({ where: { userId } });
    await tx.admissionRequest.updateMany({ where: { assignedTo: userId }, data: { assignedTo: null } });
    await tx.admissionRequest.deleteMany({ where: { userId } });
    await tx.inquiryMessage.updateMany({ where: { adminId: userId }, data: { adminId: null } });

    const threads = await tx.inquiryThread.findMany({ where: { userId }, select: { id: true } });
    if (threads.length > 0) {
      const threadIds = threads.map((thread) => thread.id);
      await tx.inquiryMessage.deleteMany({ where: { threadId: { in: threadIds } } });
      await tx.inquiryThread.deleteMany({ where: { userId } });
    }

    await tx.subscription.deleteMany({ where: { userId } });
    await tx.payment.deleteMany({ where: { userId } });

    const agent = await tx.agent.findUnique({ where: { userId }, select: { id: true } });
    if (agent) {
      await tx.commission.deleteMany({ where: { agentId: agent.id } });
      await tx.payout.deleteMany({ where: { agentId: agent.id } });
      await tx.referral.deleteMany({ where: { agentId: agent.id } });
      await tx.agent.delete({ where: { id: agent.id } });
    }
    await tx.referral.deleteMany({ where: { referredUserId: userId } });

    await tx.user.delete({ where: { id: userId } });
  });
}

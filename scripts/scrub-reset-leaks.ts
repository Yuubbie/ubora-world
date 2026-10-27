import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function isSensitive(content: string) {
  return /PASSWORD RESET/i.test(content) || /\/reset-password\?token=/i.test(content);
}

async function main() {
  const messages = await db.inquiryMessage.findMany({
    select: { id: true, content: true, threadId: true },
  });
  const leaks = messages.filter((m) => isSensitive(m.content));
  const leakThreads = new Set(leaks.map((m) => m.threadId));

  let scrubbed = 0;
  for (const leak of leaks) {
    await db.inquiryMessage.update({
      where: { id: leak.id },
      data: { content: "Password reset was requested. The reset link was removed from chat for security." },
    });
    scrubbed += 1;
  }

  const expired = await db.passwordResetToken.updateMany({
    where: { usedAt: null },
    data: { usedAt: new Date(), expiresAt: new Date() },
  });

  console.log(
    JSON.stringify({
      leakedMessagesScrubbed: scrubbed,
      threadsTouched: leakThreads.size,
      unusedResetTokensInvalidated: expired.count,
    })
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referredUserId_key" ON "Referral"("referredUserId");

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Commission" ADD COLUMN "payoutId" TEXT;

-- CreateIndex
CREATE INDEX "Commission_payoutId_idx" ON "Commission"("payoutId");

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "Payout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'pending';

-- AlterTable
ALTER TABLE "PastQuestionSet" ADD COLUMN     "approvedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Summary" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT;

-- AlterTable
ALTER TABLE "TutorialContent" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT;

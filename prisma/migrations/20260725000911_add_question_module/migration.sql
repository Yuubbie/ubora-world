-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "module" INTEGER;

-- CreateIndex
CREATE INDEX "Question_questionBankId_module_idx" ON "Question"("questionBankId", "module");

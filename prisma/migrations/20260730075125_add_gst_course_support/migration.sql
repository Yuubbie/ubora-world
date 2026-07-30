-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_departmentId_fkey";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "isGST" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "departmentId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Course_isGST_idx" ON "Course"("isGST");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

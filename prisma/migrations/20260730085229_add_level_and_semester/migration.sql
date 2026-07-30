-- CreateEnum
CREATE TYPE "Semester" AS ENUM ('first', 'second');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "level" INTEGER,
ADD COLUMN     "semester" "Semester";

-- Backfill existing rows with safe defaults
UPDATE "Course" SET "level" = 100, "semester" = 'first' WHERE "level" IS NULL;

-- Now enforce NOT NULL now that all rows have a value
ALTER TABLE "Course" ALTER COLUMN "level" SET NOT NULL,
ALTER COLUMN "semester" SET NOT NULL;
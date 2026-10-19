-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "InquirySender" AS ENUM ('visitor', 'admin');

-- CreateTable
CREATE TABLE "InquiryThread" (
    "id" TEXT NOT NULL,
    "visitorKey" TEXT,
    "userId" TEXT,
    "name" TEXT,
    "email" TEXT,
    "status" "InquiryStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InquiryThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InquiryMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "sender" "InquirySender" NOT NULL,
    "content" TEXT NOT NULL,
    "adminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InquiryMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InquiryThread_visitorKey_key" ON "InquiryThread"("visitorKey");

-- CreateIndex
CREATE INDEX "InquiryThread_userId_idx" ON "InquiryThread"("userId");

-- CreateIndex
CREATE INDEX "InquiryThread_status_updatedAt_idx" ON "InquiryThread"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "InquiryMessage_threadId_createdAt_idx" ON "InquiryMessage"("threadId", "createdAt");

-- AddForeignKey
ALTER TABLE "InquiryThread" ADD CONSTRAINT "InquiryThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InquiryMessage" ADD CONSTRAINT "InquiryMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "InquiryThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InquiryMessage" ADD CONSTRAINT "InquiryMessage_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

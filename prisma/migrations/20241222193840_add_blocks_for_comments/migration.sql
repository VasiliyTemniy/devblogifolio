-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "blockedAt" TIMESTAMP(6),
ADD COLUMN     "blockedReason" TEXT;

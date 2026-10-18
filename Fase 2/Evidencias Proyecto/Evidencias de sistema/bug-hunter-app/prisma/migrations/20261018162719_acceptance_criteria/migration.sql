-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "timeLimitHours" INTEGER NOT NULL DEFAULT 6;

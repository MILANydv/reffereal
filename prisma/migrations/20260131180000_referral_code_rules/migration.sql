-- CreateEnum
CREATE TYPE "ReferralCodeFormat" AS ENUM ('RANDOM', 'USERNAME', 'EMAIL_PREFIX');

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN "referralCodePrefix" TEXT,
ADD COLUMN "referralCodeFormat" "ReferralCodeFormat";

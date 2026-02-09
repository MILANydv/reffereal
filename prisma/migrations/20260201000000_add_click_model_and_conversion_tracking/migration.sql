-- CreateTable (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS "Click" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referralCode" TEXT NOT NULL,
    "refereeId" TEXT,
    "ipAddress" TEXT,
    "deviceFingerprint" TEXT,
    "userAgent" TEXT,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaignId" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    CONSTRAINT "Click_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- AlterTable
ALTER TABLE "Referral" ADD COLUMN IF NOT EXISTS "originalReferralCode" TEXT;
ALTER TABLE "Referral" ADD COLUMN IF NOT EXISTS "isConversionReferral" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Click_referralCode_idx" ON "Click"("referralCode");
CREATE INDEX IF NOT EXISTS "Click_referrerId_idx" ON "Click"("referrerId");
CREATE INDEX IF NOT EXISTS "Click_campaignId_idx" ON "Click"("campaignId");
CREATE INDEX IF NOT EXISTS "Click_clickedAt_idx" ON "Click"("clickedAt");

-- CreateIndex (using DO block to check if index exists first)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Referral_originalReferralCode_idx') THEN
    CREATE INDEX "Referral_originalReferralCode_idx" ON "Referral"("originalReferralCode");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Referral_isConversionReferral_idx') THEN
    CREATE INDEX "Referral_isConversionReferral_idx" ON "Referral"("isConversionReferral");
  END IF;
END $$;

-- Note: Referral_referrerId_idx already exists, so we skip creating it

-- Migrate existing data: Mark CONVERTED referrals as conversion referrals
UPDATE "Referral" SET "isConversionReferral" = true, "originalReferralCode" = "referralCode" WHERE "status" = 'CONVERTED';

-- Migrate existing data: Create Click records for CLICKED referrals
-- Note: Using cuid() equivalent - PostgreSQL extension or application-level generation
-- For now, we'll use a simple approach - the application will handle ID generation if needed
-- This migration creates the structure; data migration can be done via application script if needed

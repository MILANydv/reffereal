-- Create partial unique index to prevent duplicate conversions
-- This ensures that a refereeId can only convert once per originalReferralCode
-- Only applies to conversion referrals (isConversionReferral = true)
CREATE UNIQUE INDEX IF NOT EXISTS "Referral_originalReferralCode_refereeId_unique" 
ON "Referral"("originalReferralCode", "refereeId") 
WHERE "isConversionReferral" = true AND "originalReferralCode" IS NOT NULL;

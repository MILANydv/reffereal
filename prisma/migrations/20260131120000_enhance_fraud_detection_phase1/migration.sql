-- AlterTable: Add fraud detection configuration to App
ALTER TABLE "App" ADD COLUMN IF NOT EXISTS "fraudConfig" TEXT;

-- AlterTable: Add device fingerprinting and fraud detection fields to Referral
ALTER TABLE "Referral" ADD COLUMN IF NOT EXISTS "deviceFingerprint" TEXT;
ALTER TABLE "Referral" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;
ALTER TABLE "Referral" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "Referral" ADD COLUMN IF NOT EXISTS "flaggedBy" TEXT;
ALTER TABLE "Referral" ADD COLUMN IF NOT EXISTS "flaggedAt" TIMESTAMP(3);

-- CreateIndex for device fingerprinting
CREATE INDEX IF NOT EXISTS "Referral_deviceFingerprint_idx" ON "Referral"("deviceFingerprint");

-- AlterTable: Add manual flagging fields to FraudFlag
ALTER TABLE "FraudFlag" ADD COLUMN IF NOT EXISTS "isManual" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "FraudFlag" ADD COLUMN IF NOT EXISTS "flaggedBy" TEXT;

-- CreateIndex for manual flags
CREATE INDEX IF NOT EXISTS "FraudFlag_isManual_idx" ON "FraudFlag"("isManual");
CREATE INDEX IF NOT EXISTS "FraudFlag_createdAt_idx" ON "FraudFlag"("createdAt");

-- AlterEnum: Add new fraud types to FraudType enum
-- Note: PostgreSQL requires these to be added one at a time and cannot be rolled back easily
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'VELOCITY_CHECK' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'FraudType')) THEN
        ALTER TYPE "FraudType" ADD VALUE 'VELOCITY_CHECK';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'DEVICE_FINGERPRINT' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'FraudType')) THEN
        ALTER TYPE "FraudType" ADD VALUE 'DEVICE_FINGERPRINT';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'MANUAL_FLAG' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'FraudType')) THEN
        ALTER TYPE "FraudType" ADD VALUE 'MANUAL_FLAG';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'VPN_PROXY_DETECTED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'FraudType')) THEN
        ALTER TYPE "FraudType" ADD VALUE 'VPN_PROXY_DETECTED';
    END IF;
END $$;

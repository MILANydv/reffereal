-- AlterTable: Add description and allowedDomains to App
ALTER TABLE "App" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "App" ADD COLUMN IF NOT EXISTS "allowedDomains" TEXT;

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN "conversionWindow" INTEGER;
ALTER TABLE "Campaign" ADD COLUMN "endDate" DATETIME;
ALTER TABLE "Campaign" ADD COLUMN "level1Cap" REAL;
ALTER TABLE "Campaign" ADD COLUMN "level1Reward" REAL;
ALTER TABLE "Campaign" ADD COLUMN "level2Cap" REAL;
ALTER TABLE "Campaign" ADD COLUMN "level2Reward" REAL;
ALTER TABLE "Campaign" ADD COLUMN "rewardExpiration" INTEGER;
ALTER TABLE "Campaign" ADD COLUMN "startDate" DATETIME;
ALTER TABLE "Campaign" ADD COLUMN "tierConfig" TEXT;

-- CreateTable
CREATE TABLE "PricingPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "monthlyPrice" REAL NOT NULL,
    "yearlyPrice" REAL,
    "apiLimit" INTEGER NOT NULL,
    "maxApps" INTEGER NOT NULL,
    "overagePrice" REAL NOT NULL,
    "features" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" DATETIME NOT NULL,
    "currentPeriodEnd" DATETIME NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "trialEndsAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PricingPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL,
    "billingPeriodStart" DATETIME NOT NULL,
    "billingPeriodEnd" DATETIME NOT NULL,
    "apiUsage" INTEGER NOT NULL,
    "overageAmount" REAL NOT NULL DEFAULT 0,
    "stripeInvoiceId" TEXT,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invoice_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "events" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Webhook_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "webhookId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "response" TEXT,
    "statusCode" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebhookDelivery_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL,
    "inviteToken" TEXT,
    "inviteAcceptedAt" DATETIME,
    "lastLoginAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TeamMember_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FraudFlag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appId" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "fraudType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FraudFlag_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "rolloutPercent" INTEGER NOT NULL DEFAULT 0,
    "targetPartners" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_App" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "monthlyLimit" INTEGER NOT NULL DEFAULT 10000,
    "currentUsage" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isSandbox" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "App_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_App" ("apiKey", "createdAt", "currentUsage", "id", "monthlyLimit", "name", "partnerId", "status", "updatedAt") SELECT "apiKey", "createdAt", "currentUsage", "id", "monthlyLimit", "name", "partnerId", "status", "updatedAt" FROM "App";
DROP TABLE "App";
ALTER TABLE "new_App" RENAME TO "App";
CREATE UNIQUE INDEX "App_apiKey_key" ON "App"("apiKey");
CREATE INDEX "App_partnerId_idx" ON "App"("partnerId");
CREATE INDEX "App_apiKey_idx" ON "App"("apiKey");
CREATE INDEX "App_status_idx" ON "App"("status");
CREATE TABLE "new_Referral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "refereeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "clickedAt" DATETIME,
    "convertedAt" DATETIME,
    "rewardAmount" REAL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "parentReferralId" TEXT,
    "ipAddress" TEXT,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Referral_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Referral_parentReferralId_fkey" FOREIGN KEY ("parentReferralId") REFERENCES "Referral" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Referral" ("campaignId", "clickedAt", "convertedAt", "createdAt", "id", "refereeId", "referralCode", "referrerId", "rewardAmount", "status", "updatedAt") SELECT "campaignId", "clickedAt", "convertedAt", "createdAt", "id", "refereeId", "referralCode", "referrerId", "rewardAmount", "status", "updatedAt" FROM "Referral";
DROP TABLE "Referral";
ALTER TABLE "new_Referral" RENAME TO "Referral";
CREATE UNIQUE INDEX "Referral_referralCode_key" ON "Referral"("referralCode");
CREATE INDEX "Referral_campaignId_idx" ON "Referral"("campaignId");
CREATE INDEX "Referral_referralCode_idx" ON "Referral"("referralCode");
CREATE INDEX "Referral_referrerId_idx" ON "Referral"("referrerId");
CREATE INDEX "Referral_status_idx" ON "Referral"("status");
CREATE INDEX "Referral_parentReferralId_idx" ON "Referral"("parentReferralId");
CREATE INDEX "Referral_ipAddress_idx" ON "Referral"("ipAddress");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PricingPlan_type_key" ON "PricingPlan"("type");

-- CreateIndex
CREATE INDEX "PricingPlan_type_idx" ON "PricingPlan"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_partnerId_key" ON "Subscription"("partnerId");

-- CreateIndex
CREATE INDEX "Subscription_partnerId_idx" ON "Subscription"("partnerId");

-- CreateIndex
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Invoice_partnerId_idx" ON "Invoice"("partnerId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_createdAt_idx" ON "Invoice"("createdAt");

-- CreateIndex
CREATE INDEX "Webhook_appId_idx" ON "Webhook"("appId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_webhookId_idx" ON "WebhookDelivery"("webhookId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_success_idx" ON "WebhookDelivery"("success");

-- CreateIndex
CREATE INDEX "WebhookDelivery_nextRetryAt_idx" ON "WebhookDelivery"("nextRetryAt");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_inviteToken_key" ON "TeamMember"("inviteToken");

-- CreateIndex
CREATE INDEX "TeamMember_partnerId_idx" ON "TeamMember"("partnerId");

-- CreateIndex
CREATE INDEX "TeamMember_email_idx" ON "TeamMember"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_partnerId_email_key" ON "TeamMember"("partnerId", "email");

-- CreateIndex
CREATE INDEX "FraudFlag_appId_idx" ON "FraudFlag"("appId");

-- CreateIndex
CREATE INDEX "FraudFlag_referralCode_idx" ON "FraudFlag"("referralCode");

-- CreateIndex
CREATE INDEX "FraudFlag_isResolved_idx" ON "FraudFlag"("isResolved");

-- CreateIndex
CREATE INDEX "FraudFlag_fraudType_idx" ON "FraudFlag"("fraudType");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_key_key" ON "FeatureFlag"("key");

-- CreateIndex
CREATE INDEX "FeatureFlag_key_idx" ON "FeatureFlag"("key");

-- CreateIndex
CREATE INDEX "FeatureFlag_isEnabled_idx" ON "FeatureFlag"("isEnabled");

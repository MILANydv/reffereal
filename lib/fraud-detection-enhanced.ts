import { prisma } from './db';
import { FraudType } from '@prisma/client';
import crypto from 'crypto';

// Default fraud detection thresholds
interface FraudConfig {
  rateLimitWindow?: number; // milliseconds
  rateLimitMax?: number; // max referrals per window
  duplicateIpThreshold?: number; // max referrals from same IP
  duplicateIpWindow?: number; // time window in hours
  velocityThreshold?: number; // max conversions per hour
  suspiciousPatternMin?: number; // min referrals to check pattern
  enableDeviceFingerprinting?: boolean;
  enableVpnDetection?: boolean;
}

const DEFAULT_CONFIG: FraudConfig = {
  rateLimitWindow: 60 * 60 * 1000, // 1 hour
  rateLimitMax: 10,
  duplicateIpThreshold: 5,
  duplicateIpWindow: 24, // hours
  velocityThreshold: 20, // conversions per hour
  suspiciousPatternMin: 5,
  enableDeviceFingerprinting: true,
  enableVpnDetection: true,
};

/**
 * Generate device fingerprint from request headers
 */
export function generateDeviceFingerprint(
  userAgent: string | null,
  ipAddress: string | null,
  acceptLanguage: string | null
): string {
  const components = [
    userAgent || '',
    acceptLanguage || '',
    ipAddress || '',
  ].join('|');

  return crypto.createHash('sha256').update(components).digest('hex').substring(0, 32);
}

/**
 * Detect if IP is likely a VPN/Proxy (basic heuristic)
 */
export function isLikelyVpnOrProxy(ipAddress: string): boolean {
  // Basic heuristic: check for common VPN/proxy patterns
  // In production, use a service like MaxMind, IPQualityScore, etc.
  const suspiciousPatterns = [
    /^10\./, // Private IP
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private IP
    /^192\.168\./, // Private IP
  ];

  return suspiciousPatterns.some(pattern => pattern.test(ipAddress));
}

/**
 * Get fraud detection config for an app
 */
async function getFraudConfig(appId: string): Promise<FraudConfig> {
  const app = await prisma.app.findUnique({
    where: { id: appId },
    select: { fraudConfig: true },
  });

  if (app?.fraudConfig) {
    try {
      return { ...DEFAULT_CONFIG, ...JSON.parse(app.fraudConfig) };
    } catch (e) {
      console.error('Error parsing fraud config:', e);
    }
  }

  return DEFAULT_CONFIG;
}

/**
 * Enhanced fraud detection with Phase 1 features
 */
export async function detectFraudEnhanced(
  appId: string,
  referralCode: string,
  referrerId: string,
  refereeId: string | null,
  ipAddress: string | null,
  userAgent: string | null,
  acceptLanguage: string | null
): Promise<{ isFraud: boolean; reasons: string[]; riskScore: number }> {
  const reasons: string[] = [];
  let riskScore = 0;
  const config = await getFraudConfig(appId);

  // 1. Self-referral detection
  if (referrerId === refereeId) {
    reasons.push('Self-referral detected');
    riskScore += 50;
    await createFraudFlag(
      appId,
      referralCode,
      FraudType.SELF_REFERRAL,
      'Referrer and referee are the same user',
      { referrerId, refereeId }
    );
  }

  // 2. Duplicate IP detection (enhanced)
  if (ipAddress) {
    const duplicateIpCount = await prisma.referral.count({
      where: {
        Campaign: { appId },
        ipAddress,
        createdAt: {
          gte: new Date(Date.now() - (config.duplicateIpWindow || 24) * 60 * 60 * 1000),
        },
      },
    });

    if (duplicateIpCount >= (config.duplicateIpThreshold || 5)) {
      reasons.push(`Multiple referrals from same IP (${duplicateIpCount} in last ${config.duplicateIpWindow || 24}h)`);
      riskScore += 30;
      await createFraudFlag(
        appId,
        referralCode,
        FraudType.DUPLICATE_IP,
        `${duplicateIpCount} referrals from IP: ${ipAddress} in last ${config.duplicateIpWindow || 24} hours`,
        { ipAddress, count: duplicateIpCount }
      );
    }

    // 3. VPN/Proxy detection
    if (config.enableVpnDetection && isLikelyVpnOrProxy(ipAddress)) {
      reasons.push('VPN or Proxy detected');
      riskScore += 20;
      await createFraudFlag(
        appId,
        referralCode,
        FraudType.VPN_PROXY_DETECTED,
        `Suspicious IP pattern detected: ${ipAddress}`,
        { ipAddress }
      );
    }
  }

  // 4. Rate limiting (enhanced with configurable thresholds)
  const recentReferrals = await prisma.referral.count({
    where: {
      Campaign: { appId },
      referrerId,
      createdAt: {
        gte: new Date(Date.now() - (config.rateLimitWindow || 3600000)),
      },
    },
  });

  if (recentReferrals >= (config.rateLimitMax || 10)) {
    reasons.push(`Rate limit exceeded (${recentReferrals} referrals in window)`);
    riskScore += 40;
    await createFraudFlag(
      appId,
      referralCode,
      FraudType.RATE_LIMIT_EXCEEDED,
      `${recentReferrals} referrals in last ${(config.rateLimitWindow || 3600000) / 60000} minutes by user ${referrerId}`,
      { referrerId, count: recentReferrals }
    );
  }

  // 5. Velocity check (conversion speed)
  if (refereeId) {
    const recentConversions = await prisma.referral.count({
      where: {
        Campaign: { appId },
        referrerId,
        status: 'CONVERTED',
        convertedAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
    });

    if (recentConversions >= (config.velocityThreshold || 20)) {
      reasons.push(`Velocity check failed (${recentConversions} conversions in last hour)`);
      riskScore += 35;
      await createFraudFlag(
        appId,
        referralCode,
        FraudType.VELOCITY_CHECK,
        `${recentConversions} conversions in last hour by user ${referrerId}`,
        { referrerId, conversions: recentConversions }
      );
    }
  }

  // 6. Device fingerprinting
  if (config.enableDeviceFingerprinting && userAgent) {
    const deviceFingerprint = generateDeviceFingerprint(userAgent, ipAddress, acceptLanguage);

    const duplicateDeviceCount = await prisma.referral.count({
      where: {
        Campaign: { appId },
        deviceFingerprint,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (duplicateDeviceCount >= 10) {
      reasons.push(`Multiple referrals from same device (${duplicateDeviceCount} in 24h)`);
      riskScore += 25;
      await createFraudFlag(
        appId,
        referralCode,
        FraudType.DEVICE_FINGERPRINT,
        `${duplicateDeviceCount} referrals from same device fingerprint in last 24 hours`,
        { deviceFingerprint, count: duplicateDeviceCount }
      );
    }
  }

  // 7. Suspicious pattern detection
  const suspiciousPattern = await detectSuspiciousPattern(appId, referrerId, config);
  if (suspiciousPattern) {
    reasons.push('Suspicious pattern detected (automated behavior)');
    riskScore += 30;
    await createFraudFlag(
      appId,
      referralCode,
      FraudType.SUSPICIOUS_PATTERN,
      'Automated or bot-like behavior detected',
      { referrerId }
    );
  }

  return {
    isFraud: reasons.length > 0 || riskScore >= 50,
    reasons,
    riskScore: Math.min(riskScore, 100),
  };
}

/**
 * Detect fraud during conversion (Phase 1)
 */
export async function detectConversionFraud(
  appId: string,
  referralId: string,
  referralCode: string,
  refereeId: string,
  ipAddress: string | null
): Promise<{ isFraud: boolean; reasons: string[]; riskScore: number }> {
  const reasons: string[] = [];
  let riskScore = 0;

  // Fetch referral to check timing
  const referral = await prisma.referral.findUnique({
    where: { id: referralId },
    select: { createdAt: true, ipAddress: true, referrerId: true },
  });

  if (!referral) return { isFraud: false, reasons: [], riskScore: 0 };

  // 1. Impossible conversion time (e.g. < 5 seconds from creation)
  const timeDiff = Date.now() - referral.createdAt.getTime();
  if (timeDiff < 5000) {
    reasons.push('Impossible conversion time (< 5s)');
    riskScore += 100; // Almost certainly a bot

    await createFraudFlag(
      appId,
      referralCode,
      FraudType.IMPOSSIBLE_CONVERSION_TIME,
      `Conversion happened ${timeDiff}ms after referral creation. Bots likely.`,
      { timeDiffMs: timeDiff }
    );
  }

  // 2. IP Match Check (Referrer IP == Converter IP)
  if (ipAddress && referral.ipAddress && ipAddress === referral.ipAddress) {
    // If not self-referral (already checked at creation), this might be same household or testing
    // We flag it but maybe with lower score effectively than self-referral
    if (referral.referrerId !== refereeId) {
      reasons.push('Conversion from same IP as Referrer');
      riskScore += 60;

      await createFraudFlag(
        appId,
        referralCode,
        FraudType.DUPLICATE_IP,
        'Conversion IP matches Referrer IP',
        { ipAddress }
      );
    }
  }

  return {
    isFraud: reasons.length > 0,
    reasons,
    riskScore,
  };
}

async function detectSuspiciousPattern(
  appId: string,
  referrerId: string,
  config: FraudConfig
): Promise<boolean> {
  const referrals = await prisma.referral.findMany({
    where: {
      Campaign: { appId },
      referrerId,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    orderBy: { createdAt: 'asc' },
    take: 20,
  });

  if (referrals.length < (config.suspiciousPatternMin || 5)) return false;

  const timestamps = referrals.map((r) => r.createdAt.getTime());
  const intervals: number[] = [];

  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i - 1]);
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance =
    intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) /
    intervals.length;

  // More sophisticated pattern detection
  const isUniform = variance < 1000; // Very consistent timing
  const isTooFast = avgInterval < 5000; // Less than 5 seconds between referrals
  const isTooRegular = variance < 500 && avgInterval > 0; // Extremely regular pattern

  return isUniform || isTooFast || isTooRegular;
}

async function createFraudFlag(
  appId: string,
  referralCode: string,
  fraudType: FraudType,
  description: string,
  metadata?: Record<string, any>
) {
  await prisma.fraudFlag.create({
    data: {
      appId,
      referralCode,
      fraudType,
      description,
      metadata: metadata ? JSON.stringify(metadata) : null,
      isManual: false,
    },
  });
}

/**
 * Create fraud flag when partner manually flags a referral
 */
export async function createManualFraudFlag(
  appId: string,
  referralCode: string,
  flaggedBy: string,
  description?: string
) {
  const flag = await prisma.fraudFlag.create({
    data: {
      appId,
      referralCode,
      fraudType: FraudType.MANUAL_FLAG,
      description: description || `Referral manually flagged by partner`,
      isManual: true,
      flaggedBy,
      metadata: JSON.stringify({ flaggedBy, flaggedAt: new Date().toISOString() }),
    },
    include: {
      App: {
        include: {
          Partner: {
            include: {
              User: {
                select: {
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Notify admins about manual flag
  await notifyAdminsOfManualFlag(flag);

  return flag;
}

/**
 * Notify all admins when a partner manually flags a referral
 */
async function notifyAdminsOfManualFlag(flag: any) {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: 'SUPER_ADMIN',
        active: true,
      },
    });

    const { notifyCustomAdmin } = await import('./notifications');

    for (const admin of admins) {
      await notifyCustomAdmin(
        admin.id,
        'Manual Fraud Flag Created',
        `Partner "${flag.app.partner.user.name || flag.app.partner.user.email}" manually flagged referral code "${flag.referralCode}" in app "${flag.app.name}".`,
        {
          flagId: flag.id,
          appId: flag.appId,
          appName: flag.app.name,
          referralCode: flag.referralCode,
          partnerEmail: flag.app.partner.user.email,
          partnerName: flag.app.partner.user.name,
        }
      );
    }
  } catch (error) {
    console.error('Error notifying admins of manual flag:', error);
  }
}

// Re-export original functions for backward compatibility
export { getFraudFlags, resolveFraudFlag } from './fraud-detection';

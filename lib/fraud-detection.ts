import { prisma } from './db';
import { FraudType } from '@prisma/client';

const RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 10;

export async function detectFraud(
  appId: string,
  referralCode: string,
  referrerId: string,
  refereeId: string | null,
  ipAddress: string | null
): Promise<{ isFraud: boolean; reasons: string[] }> {
  const reasons: string[] = [];

  if (referrerId === refereeId) {
    reasons.push('Self-referral detected');
    await createFraudFlag(
      appId,
      referralCode,
      FraudType.SELF_REFERRAL,
      'Referrer and referee are the same user'
    );
  }

  if (ipAddress) {
    const duplicateIpCount = await prisma.referral.count({
      where: {
        campaign: { appId },
        ipAddress,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (duplicateIpCount >= 5) {
      reasons.push('Multiple referrals from same IP');
      await createFraudFlag(
        appId,
        referralCode,
        FraudType.DUPLICATE_IP,
        `${duplicateIpCount} referrals from IP: ${ipAddress} in last 24 hours`
      );
    }
  }

  const recentReferrals = await prisma.referral.count({
    where: {
      campaign: { appId },
      referrerId,
      createdAt: { gte: new Date(Date.now() - RATE_LIMIT_WINDOW) },
    },
  });

  if (recentReferrals >= RATE_LIMIT_MAX) {
    reasons.push('Rate limit exceeded');
    await createFraudFlag(
      appId,
      referralCode,
      FraudType.RATE_LIMIT_EXCEEDED,
      `${recentReferrals} referrals in last hour by user ${referrerId}`
    );
  }

  const suspiciousPattern = await detectSuspiciousPattern(appId, referrerId);
  if (suspiciousPattern) {
    reasons.push('Suspicious pattern detected');
    await createFraudFlag(
      appId,
      referralCode,
      FraudType.SUSPICIOUS_PATTERN,
      'Automated or bot-like behavior detected'
    );
  }

  return {
    isFraud: reasons.length > 0,
    reasons,
  };
}

async function detectSuspiciousPattern(
  appId: string,
  referrerId: string
): Promise<boolean> {
  const referrals = await prisma.referral.findMany({
    where: {
      campaign: { appId },
      referrerId,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    orderBy: { createdAt: 'asc' },
    take: 10,
  });

  if (referrals.length < 5) return false;

  const timestamps = referrals.map((r) => r.createdAt.getTime());
  const intervals: number[] = [];

  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i - 1]);
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance =
    intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) /
    intervals.length;

  const isUniform = variance < 1000;
  const isTooFast = avgInterval < 5000;

  return isUniform || isTooFast;
}

async function createFraudFlag(
  appId: string,
  referralCode: string,
  fraudType: FraudType,
  description: string
) {
  await prisma.fraudFlag.create({
    data: {
      appId,
      referralCode,
      fraudType,
      description,
    },
  });
}

export async function getFraudFlags(appId: string, resolved: boolean = false) {
  return await prisma.fraudFlag.findMany({
    where: {
      appId,
      isResolved: resolved,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function resolveFraudFlag(flagId: string, userId: string) {
  return await prisma.fraudFlag.update({
    where: { id: flagId },
    data: {
      isResolved: true,
      resolvedBy: userId,
      resolvedAt: new Date(),
    },
  });
}

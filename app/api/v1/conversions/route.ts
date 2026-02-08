import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateApiKey, logApiUsage } from '@/lib/api-middleware';
import { generateReferralCode } from '@/lib/api-key';
import { triggerWebhook } from '@/lib/webhooks';
import { notifyReferralConversion } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  const authResult = await authenticateApiKey(request);

  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { app } = authResult;

  try {
    const body = await request.json();
    const { referralCode, refereeId, amount, metadata } = body;

    if (!referralCode || !refereeId) {
      return NextResponse.json(
        { error: 'referralCode and refereeId are required' },
        { status: 400 }
      );
    }

    const referral = await prisma.referral.findUnique({
      where: { referralCode },
      include: {
        Campaign: {
          include: { App: true },
        },
      },
    });

    if (!referral) {
      return NextResponse.json({ error: 'Referral code not found' }, { status: 404 });
    }

    if (referral.Campaign.appId !== app.id) {
      return NextResponse.json(
        { error: 'Referral does not belong to this app' },
        { status: 403 }
      );
    }

    if (referral.Campaign.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Campaign is not active' }, { status: 400 });
    }

    const campaign = referral.Campaign;
    const now = new Date();

    if (campaign.endDate && now > campaign.endDate) {
      return NextResponse.json(
        { error: 'Campaign has ended; conversions are no longer accepted' },
        { status: 400 }
      );
    }

    if (campaign.conversionWindow != null && campaign.conversionWindow > 0) {
      const cutoff = referral.clickedAt || referral.createdAt;
      const windowEnd = new Date(cutoff.getTime() + campaign.conversionWindow * 24 * 60 * 60 * 1000);
      if (now > windowEnd) {
        return NextResponse.json(
          { error: `Conversion window (${campaign.conversionWindow} days) has expired for this referral` },
          { status: 400 }
        );
      }
    }

    let rewardAmount = 0;

    if (campaign.rewardModel === 'FIXED_CURRENCY') {
      rewardAmount = campaign.rewardValue;
    } else if (campaign.rewardModel === 'PERCENTAGE' && amount) {
      rewardAmount = (amount * campaign.rewardValue) / 100;
    } else if (campaign.rewardModel === 'TIERED' && campaign.tierConfig) {
      type Tier = { minConversions: number; rewardValue: number; rewardCap?: number };
      let tiers: Tier[] = [];
      try {
        const parsed = JSON.parse(campaign.tierConfig) as { tiers?: Tier[] };
        tiers = Array.isArray(parsed?.tiers) ? parsed.tiers : [];
      } catch {
        tiers = [];
      }
      const convertedCount = await prisma.referral.count({
        where: {
          campaignId: campaign.id,
          referrerId: referral.referrerId,
          status: 'CONVERTED',
        },
      });
      tiers.sort((a, b) => (b.minConversions ?? 0) - (a.minConversions ?? 0));
      let tier: Tier | null = null;
      for (const t of tiers) {
        if (convertedCount >= (t.minConversions ?? 0)) {
          tier = t;
          break;
        }
      }
      if (tier) {
        rewardAmount = tier.rewardValue;
        if (tier.rewardCap != null && rewardAmount > tier.rewardCap) {
          rewardAmount = tier.rewardCap;
        }
      } else {
        rewardAmount = campaign.rewardValue;
        if (campaign.rewardCap != null && rewardAmount > campaign.rewardCap) {
          rewardAmount = campaign.rewardCap;
        }
      }
    }

    if (campaign.rewardCap != null && rewardAmount > campaign.rewardCap) {
      rewardAmount = campaign.rewardCap;
    }

    // Fraud Detection Check
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') || null;

    const { detectConversionFraud } = await import('@/lib/fraud-detection-enhanced');
    const { notifyPartnerFraud, notifyAdminFraud } = await import('@/lib/notifications');

    const fraudCheck = await detectConversionFraud(
      app.id,
      referral.id,
      referralCode,
      refereeId,
      ipAddress
    );

    let status = 'CONVERTED';
    if (fraudCheck.isFraud) {
      status = 'FLAGGED';

      // Notify Partner
      try {
        const partner = await prisma.partner.findUnique({
          where: { id: app.partnerId },
          include: { User: true },
        });
        if (partner?.User) {
          await notifyPartnerFraud(partner.User.id, {
            referralCode,
            appName: app.name,
            fraudType: fraudCheck.reasons[0] || 'Unknown Fraud',
          });
        }
      } catch (err) {
        console.error('Error notifying partner of fraud:', err);
      }

      // Notify Admins
      try {
        await notifyAdminFraud(
          'Conversion Fraud Detected',
          `High risk conversion in app "${app.name}" for code "${referralCode}". Reason: ${fraudCheck.reasons.join(', ')}`,
          {
            appId: app.id,
            referralCode,
            riskScore: fraudCheck.riskScore,
            reasons: fraudCheck.reasons,
          }
        );
      } catch (err) {
        console.error('Error notifying admins of fraud:', err);
      }
    }

    const [updatedReferral, conversion] = await prisma.$transaction([
      prisma.referral.update({
        where: { id: referral.id },
        data: {
          status: status as any, // Cast to avoid type issues if enum not updated in context
          refereeId,
          convertedAt: new Date(),
          rewardAmount,
          isFlagged: fraudCheck.isFraud,
        },
      }),
      prisma.conversion.create({
        data: {
          Referral: { connect: { id: referral.id } },
          amount,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      }),
    ]);

    // Create Reward ledger row for level-1 (only if CONVERTED; FLAGGED rewards stay out of payout flow until resolved)
    if (status === 'CONVERTED') {
      await prisma.reward.create({
        data: {
          referralId: updatedReferral.id,
          conversionId: conversion.id,
          appId: app.id,
          userId: referral.referrerId,
          amount: rewardAmount,
          currency: 'USD',
          status: 'PENDING',
          level: 1,
        },
      });
    }

    // Multi-level: if referrer was referred by someone in this campaign, credit level-2 reward
    if (
      status === 'CONVERTED' &&
      campaign.referralType === 'MULTI_LEVEL' &&
      campaign.level2Reward != null &&
      campaign.level2Reward > 0
    ) {
      const parentReferral = await prisma.referral.findFirst({
        where: {
          campaignId: campaign.id,
          refereeId: referral.referrerId,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (parentReferral) {
        let level2Amount = campaign.level2Reward;
        if (campaign.level2Cap != null && level2Amount > campaign.level2Cap) {
          level2Amount = campaign.level2Cap;
        }
        const l2Code = generateReferralCode();
        const l2Referral = await prisma.$transaction(async (tx) => {
          const r = await tx.referral.create({
            data: {
              Campaign: { connect: { id: campaign.id } },
              referrerId: parentReferral.referrerId,
              refereeId: referral.referrerId,
              referralCode: l2Code,
              status: 'CONVERTED',
              convertedAt: new Date(),
              rewardAmount: level2Amount,
              level: 2,
              parentReferralId: referral.id,
            },
          });
          const l2Conversion = await tx.conversion.create({
            data: {
              Referral: { connect: { id: r.id } },
              amount: null,
              metadata: JSON.stringify({ type: 'level2', parentReferralId: referral.id }),
            },
          });
          await tx.reward.create({
            data: {
              referralId: r.id,
              conversionId: l2Conversion.id,
              appId: app.id,
              userId: parentReferral.referrerId,
              amount: level2Amount,
              currency: 'USD',
              status: 'PENDING',
              level: 2,
            },
          });
          return r;
        });
        await triggerWebhook(app.id, 'REWARD_CREATED', {
          referralId: l2Referral.id,
          referrerId: l2Referral.referrerId,
          rewardAmount: level2Amount,
          campaignId: campaign.id,
          level: 2,
        });
      }
    }

    await logApiUsage(app.id, '/api/v1/conversions', request);

    await triggerWebhook(app.id, 'REFERRAL_CONVERTED', {
      referralId: updatedReferral.id,
      referralCode: updatedReferral.referralCode,
      conversionId: conversion.id,
      rewardAmount: updatedReferral.rewardAmount,
      convertedAt: updatedReferral.convertedAt,
      campaignId: referral.campaignId,
    });

    await triggerWebhook(app.id, 'REWARD_CREATED', {
      referralId: updatedReferral.id,
      referrerId: referral.referrerId,
      rewardAmount: updatedReferral.rewardAmount,
      campaignId: referral.campaignId,
    });

    // Send notification to partner
    try {
      const partner = await prisma.partner.findUnique({
        where: { id: app.partnerId },
        include: { User: true },
      });

      if (partner?.User) {
        await notifyReferralConversion(partner.User.id, {
          code: updatedReferral.referralCode,
          rewardAmount: updatedReferral.rewardAmount || undefined,
          campaignName: campaign.name,
        });
      }
    } catch (error) {
      console.error('[Notification] Error sending conversion notification:', error);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      success: true,
      referralId: updatedReferral.id,
      conversionId: conversion.id,
      rewardAmount: updatedReferral.rewardAmount,
      status: updatedReferral.status,
    }, { status: 201 });
  } catch (error) {
    console.error('Error tracking conversion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

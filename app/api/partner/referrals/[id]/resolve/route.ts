import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { triggerWebhook } from '@/lib/webhooks';
import { logger } from '@/lib/logger';

/**
 * POST /api/partner/referrals/[id]/resolve
 * Resolve fraud flag(s) for a referral and clear its flagged state. Partner must own the app.
 * Restores referral status to CONVERTED / CLICKED / PENDING based on conversion/click state.
 * If resolving a CONVERTED referral, creates Reward(s) if missing (level-1 and level-2 if applicable).
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const referral = await prisma.referral.findFirst({
      where: { id },
      include: {
        Campaign: {
          include: {
            App: {
              select: {
                id: true,
                partnerId: true,
              },
            },
          },
        },
        Conversion: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!referral) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 });
    }

    if (referral.Campaign.App.partnerId !== session.user.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const appId = referral.Campaign.App.id;
    const campaign = referral.Campaign;

    // Restore referral: clear flag and set status from conversion/click state
    const newStatus = referral.convertedAt
      ? 'CONVERTED'
      : referral.clickedAt
        ? 'CLICKED'
        : 'PENDING';

    // Transaction: resolve fraud flags and update referral only (no Reward table access).
    // Reward creation runs after, so resolve still succeeds when Reward table is missing (e.g. migrations not run).
    const updatedReferral = await prisma.$transaction(async (tx) => {
      await tx.fraudFlag.updateMany({
        where: {
          appId,
          referralCode: referral.referralCode,
          isResolved: false,
        },
        data: {
          isResolved: true,
          resolvedBy: session.user.id!,
          resolvedAt: new Date(),
        },
      });

      const updated = await tx.referral.update({
        where: { id },
        data: {
          isFlagged: false,
          flaggedBy: null,
          flaggedAt: null,
          status: newStatus,
        },
        include: {
          Conversion: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      return updated;
    }, {
      isolationLevel: 'ReadCommitted',
      maxWait: 5000,
      timeout: 10000,
    });

    // Create rewards if resolving to CONVERTED (outside transaction so P2021 does not fail resolve)
    let rewardTableMissing = false;
    if (newStatus === 'CONVERTED' && referral.convertedAt && referral.Conversion.length > 0) {
      try {
        const conversions = updatedReferral.Conversion;
        for (const conversion of conversions) {
          const existingReward = await prisma.reward.findUnique({
            where: { conversionId: conversion.id },
          });
          if (!existingReward && referral.rewardAmount != null && referral.rewardAmount > 0) {
            await prisma.reward.create({
              data: {
                referralId: referral.id,
                conversionId: conversion.id,
                appId,
                userId: referral.referrerId,
                amount: referral.rewardAmount!,
                currency: 'USD',
                status: 'PENDING',
                level: 1,
              },
            });
          }
        }
        if (referral.level === 2 && referral.rewardAmount != null && referral.rewardAmount > 0) {
          const l2Conversion = conversions[0];
          if (l2Conversion) {
            const existingL2Reward = await prisma.reward.findFirst({
              where: { referralId: referral.id, level: 2 },
            });
            if (!existingL2Reward) {
              await prisma.reward.create({
                data: {
                  referralId: referral.id,
                  conversionId: l2Conversion.id,
                  appId,
                  userId: referral.referrerId,
                  amount: referral.rewardAmount!,
                  currency: 'USD',
                  status: 'PENDING',
                  level: 2,
                },
              });
            }
          }
        }
      } catch (rewardErr: unknown) {
        const code = (rewardErr as { code?: string })?.code;
        if (code === 'P2021') {
          rewardTableMissing = true;
          console.warn('Reward table does not exist; resolve succeeded but rewards were not created. Run: npx prisma migrate deploy');
        } else {
          throw rewardErr;
        }
      }
    }

    // Trigger webhooks when rewards exist (skip if Reward table was missing)
    if (!rewardTableMissing && newStatus === 'CONVERTED' && referral.convertedAt && referral.Conversion.length > 0) {
      const conversions = referral.Conversion;
      for (const conversion of conversions) {
        try {
          const existingReward = await prisma.reward.findUnique({
            where: { conversionId: conversion.id },
          });
          if (!existingReward && referral.rewardAmount != null && referral.rewardAmount > 0) {
            await logger.info('Reward created', 'api.reward.created', {
              appId,
              referralId: referral.id,
              conversionId: conversion.id,
              level: 1,
              amount: referral.rewardAmount,
            });
            await triggerWebhook(appId, 'REWARD_CREATED', {
              referralId: referral.id,
              referrerId: referral.referrerId,
              rewardAmount: referral.rewardAmount,
              campaignId: campaign.id,
              level: 1,
            });
          }
        } catch (err) {
          console.error('Error triggering reward webhook:', err);
        }
      }
      if (referral.level === 2 && referral.rewardAmount != null && referral.rewardAmount > 0) {
        const l2Conversion = conversions[0];
        if (l2Conversion) {
          try {
            const existingL2Reward = await prisma.reward.findFirst({
              where: { referralId: referral.id, level: 2 },
            });
            if (!existingL2Reward) {
              await logger.info('Reward created', 'api.reward.created', {
                appId,
                referralId: referral.id,
                conversionId: l2Conversion.id,
                level: 2,
                amount: referral.rewardAmount ?? 0,
              });
              await triggerWebhook(appId, 'REWARD_CREATED', {
                referralId: referral.id,
                referrerId: referral.referrerId,
                rewardAmount: referral.rewardAmount,
                campaignId: campaign.id,
                level: 2,
              });
            }
          } catch (err) {
            console.error('Error triggering level-2 reward webhook:', err);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      ...(rewardTableMissing && {
        warning: 'Reward table not found. Referral resolved; run `npx prisma migrate deploy` to enable reward creation.',
      }),
    });
  } catch (error) {
    console.error('Error resolving referral flag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

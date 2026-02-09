import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { resolveFraudFlag } from '@/lib/fraud-detection';
import { triggerWebhook } from '@/lib/webhooks';

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

    // Resolve all unresolved fraud flags for this referral (appId + referralCode)
    const flags = await prisma.fraudFlag.findMany({
      where: {
        appId,
        referralCode: referral.referralCode,
        isResolved: false,
      },
    });

    for (const flag of flags) {
      await resolveFraudFlag(flag.id, session.user.id!);
    }

    // Restore referral: clear flag and set status from conversion/click state
    const newStatus = referral.convertedAt
      ? 'CONVERTED'
      : referral.clickedAt
        ? 'CLICKED'
        : 'PENDING';

    // Update referral status and clear flags
    const updatedReferral = await prisma.referral.update({
      where: { id },
      data: {
        isFlagged: false,
        flaggedBy: null,
        flaggedAt: null,
        status: newStatus,
      },
    });

    // If resolving to CONVERTED and conversion exists, ensure Reward(s) are created
    if (newStatus === 'CONVERTED' && referral.convertedAt && referral.Conversion.length > 0) {
      // Find the most recent conversion (or all if multiple)
      const conversions = referral.Conversion;

      for (const conversion of conversions) {
        // Check if Reward already exists for this conversion
        const existingReward = await prisma.reward.findUnique({
          where: { conversionId: conversion.id },
        });

        if (!existingReward && referral.rewardAmount != null && referral.rewardAmount > 0) {
          // Create level-1 reward in a transaction
          await prisma.$transaction(async (tx) => {
            await tx.reward.create({
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
          });

          // Trigger webhook
          await triggerWebhook(appId, 'REWARD_CREATED', {
            referralId: referral.id,
            referrerId: referral.referrerId,
            rewardAmount: referral.rewardAmount,
            campaignId: campaign.id,
            level: 1,
          });
        }
      }

      // Multi-level: if this referral is level-2, ensure level-2 reward exists for the parent advocate
      if (referral.level === 2 && referral.rewardAmount != null && referral.rewardAmount > 0) {
        // Level-2 referral: referrerId is the parent advocate (who should get the reward)
        // Find conversion for this level-2 referral (most recent)
        const l2Conversion = conversions[0];
        if (l2Conversion) {
          const existingL2Reward = await prisma.reward.findFirst({
            where: {
              referralId: referral.id,
              level: 2,
            },
          });

          if (!existingL2Reward) {
            await prisma.$transaction(async (tx) => {
              await tx.reward.create({
                data: {
                  referralId: referral.id,
                  conversionId: l2Conversion.id,
                  appId,
                  userId: referral.referrerId, // Parent advocate gets level-2 reward
                  amount: referral.rewardAmount!,
                  currency: 'USD',
                  status: 'PENDING',
                  level: 2,
                },
              });
            });

            await triggerWebhook(appId, 'REWARD_CREATED', {
              referralId: referral.id,
              referrerId: referral.referrerId,
              rewardAmount: referral.rewardAmount,
              campaignId: campaign.id,
              level: 2,
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resolving referral flag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateApiKey, logApiUsage } from '@/lib/api-middleware';
import { generateReferralCode } from '@/lib/api-key';
import { triggerWebhook } from '@/lib/webhooks';
import { notifyReferralConversion } from '@/lib/notifications';
import { getClientIp } from '@/lib/client-ip';
import { logger } from '@/lib/logger';

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

    // Find the original referral code generation record (not conversion referrals)
    const originalReferral = await prisma.referral.findFirst({
      where: {
        referralCode,
        isConversionReferral: false, // Only find the original code generation record
      },
      include: {
        Campaign: {
          include: { App: true },
        },
      },
    });

    if (!originalReferral) {
      return NextResponse.json({ error: 'Referral code not found' }, { status: 404 });
    }

    if (originalReferral.Campaign.appId !== app.id) {
      return NextResponse.json(
        { error: 'Referral does not belong to this app' },
        { status: 403 }
      );
    }

    if (originalReferral.Campaign.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Campaign is not active' }, { status: 400 });
    }

    const campaign = originalReferral.Campaign;
    const now = new Date();

    if (campaign.endDate && now > campaign.endDate) {
      return NextResponse.json(
        { error: 'Campaign has ended; conversions are no longer accepted' },
        { status: 400 }
      );
    }

    // Check conversion window - use most recent click or original referral creation
    if (campaign.conversionWindow != null && campaign.conversionWindow > 0) {
      const latestClick = await prisma.click.findFirst({
        where: { referralCode, refereeId },
        orderBy: { clickedAt: 'desc' },
      });
      const cutoff = latestClick?.clickedAt || originalReferral.createdAt;
      const windowEnd = new Date(cutoff.getTime() + campaign.conversionWindow * 24 * 60 * 60 * 1000);
      if (now > windowEnd) {
        return NextResponse.json(
          { error: `Conversion window (${campaign.conversionWindow} days) has expired for this referral` },
          { status: 400 }
        );
      }
    }

    // Fraud Detection Check (before transaction)
    const ipAddress = getClientIp(request);
    const { detectConversionFraud } = await import('@/lib/fraud-detection-enhanced');
    const { notifyPartnerFraud, notifyAdminFraud } = await import('@/lib/notifications');

    const fraudCheck = await detectConversionFraud(
      app.id,
      originalReferral.id,
      referralCode,
      refereeId,
      ipAddress
    );

    let status = 'CONVERTED';
    if (fraudCheck.isFraud) {
      status = 'FLAGGED';
    }

    // Generate conversion referral code with retry logic
    let conversionReferralCode: string;
    let conversionCodeAttempts = 0;
    const maxConversionCodeAttempts = 5;
    
    // Create a NEW Referral record for this conversion
    // All critical operations happen inside this transaction with Serializable isolation
    const [conversionReferral, conversion, fraudFlags] = await prisma.$transaction(async (tx) => {
      // 1. Check for duplicate INSIDE transaction (prevents race condition)
      const existingConversion = await tx.referral.findFirst({
        where: {
          originalReferralCode: referralCode,
          refereeId,
          isConversionReferral: true,
          status: { in: ['CONVERTED', 'FLAGGED'] },
        },
      });

      if (existingConversion) {
        throw new Error('DUPLICATE_CONVERSION');
      }

      // 2. Generate unique conversion referral code (with retry inside transaction)
      do {
        conversionReferralCode = generateReferralCode();
        conversionCodeAttempts++;
        const codeExists = await tx.referral.findUnique({
          where: { referralCode: conversionReferralCode },
        });
        if (!codeExists) break;
        if (conversionCodeAttempts >= maxConversionCodeAttempts) {
          throw new Error('FAILED_TO_GENERATE_CONVERSION_CODE');
        }
      } while (true);

      // 3. Calculate reward amount (including tiered calculation INSIDE transaction)
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
        // Count conversion referrals INSIDE transaction (prevents race condition)
        const convertedCount = await tx.referral.count({
          where: {
            campaignId: campaign.id,
            referrerId: originalReferral.referrerId,
            isConversionReferral: true,
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

      // 4. Create new Referral record for this conversion
      const newReferral = await tx.referral.create({
        data: {
          Campaign: { connect: { id: campaign.id } },
          referralCode: conversionReferralCode,
          referrerId: originalReferral.referrerId, // Original referrer (User A) gets credit
          refereeId, // The user who converted (D or E)
          status: status as any,
          convertedAt: new Date(),
          rewardAmount,
          isFlagged: fraudCheck.isFraud,
          originalReferralCode: referralCode, // Link to original code
          isConversionReferral: true, // Mark as conversion record
          level: 1,
          ipAddress: ipAddress || null,
        },
      });
      
      // 5. Create Conversion record
      const conv = await tx.conversion.create({
        data: {
          Referral: { connect: { id: newReferral.id } },
          amount,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });
      
      // 6. Create Reward if CONVERTED (inside transaction)
      if (status === 'CONVERTED') {
        await tx.reward.create({
          data: {
            referralId: newReferral.id,
            conversionId: conv.id,
            appId: app.id,
            userId: originalReferral.referrerId, // Credit original referrer (User A)
            amount: rewardAmount,
            currency: 'USD',
            status: 'PENDING',
            level: 1,
          },
        });
      }

      // 7. Create FraudFlags INSIDE transaction (atomic with conversion)
      const flags = [];
      if (fraudCheck.isFraud) {
        const { FraudType } = await import('@prisma/client');
        
        for (const reason of fraudCheck.reasons) {
          let fraudType = FraudType.SUSPICIOUS_PATTERN;
          if (reason.includes('Impossible conversion time')) {
            fraudType = FraudType.IMPOSSIBLE_CONVERSION_TIME;
          } else if (reason.includes('same IP')) {
            fraudType = FraudType.DUPLICATE_IP;
          } else if (reason.includes('Duplicate')) {
            fraudType = FraudType.SELF_REFERRAL;
          }
          
          const flag = await tx.fraudFlag.create({
            data: {
              appId: app.id,
              referralCode: conversionReferralCode, // Flag the conversion referral, not original code
              fraudType,
              description: `Conversion fraud: ${reason}`,
              metadata: JSON.stringify({ refereeId, originalReferralCode: referralCode }),
            },
          });
          flags.push(flag);
        }
      }
      
      return [newReferral, conv, flags];
    }, {
      isolationLevel: 'Serializable', // Prevent phantom reads and ensure consistency
      maxWait: 5000,
      timeout: 10000,
    });

    // Alias for code paths that expect a variable named "referral" (e.g. notifications)
    const referral = conversionReferral;

    // Fraud flags are now created inside the transaction
    // Send notifications if fraud was detected
    if (fraudCheck.isFraud && fraudFlags.length > 0) {
      // Notify Partner
      try {
        const partner = await prisma.partner.findUnique({
          where: { id: app.partnerId },
          include: { User: true },
        });
        if (partner?.User) {
          await notifyPartnerFraud(partner.User.id, {
            referralCode: originalReferral.referralCode,
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
          `High risk conversion in app "${app.name}" for code "${referralCode}". Referee: ${refereeId}. Reason: ${fraudCheck.reasons.join(', ')}`,
          {
            appId: app.id,
            referralCode: originalReferral.referralCode,
            conversionReferralCode: conversionReferral.referralCode,
            refereeId,
            riskScore: fraudCheck.riskScore,
            reasons: fraudCheck.reasons,
          }
        );
      } catch (err) {
        console.error('Error notifying admins of fraud:', err);
      }
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
          refereeId: originalReferral.referrerId,
          isConversionReferral: true,
          status: 'CONVERTED',
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
              refereeId: originalReferral.referrerId,
              referralCode: l2Code,
              status: 'CONVERTED',
              convertedAt: new Date(),
              rewardAmount: level2Amount,
              level: 2,
              parentReferralId: conversionReferral.id,
              originalReferralCode: originalReferral.referralCode,
              isConversionReferral: true,
            },
          });
          const l2Conversion = await tx.conversion.create({
            data: {
              Referral: { connect: { id: r.id } },
              amount: null,
              metadata: JSON.stringify({ type: 'level2', parentReferralId: conversionReferral.id }),
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
          return { r, l2Conversion };
        });
        const l2ReferralForWebhook = l2Referral.r;
        await triggerWebhook(app.id, 'REWARD_CREATED', {
          referralId: l2ReferralForWebhook.id,
          referrerId: l2ReferralForWebhook.referrerId,
          rewardAmount: level2Amount,
          campaignId: campaign.id,
          level: 2,
        });
        await logger.info('Reward created', 'api.reward.created', {
          appId: app.id,
          referralId: l2Referral.r.id,
          conversionId: l2Referral.l2Conversion.id,
          level: 2,
          amount: level2Amount,
        });
      }
    }

    await logApiUsage(app.id, '/api/v1/conversions', request);

    await logger.info('Conversion recorded', 'api.v1.conversions', {
      appId: app.id,
      referralId: conversionReferral.id,
      conversionId: conversion.id,
      refereeId,
      referrerId: originalReferral.referrerId,
      rewardsCreated: status === 'CONVERTED',
    });

    if (status === 'CONVERTED' && conversionReferral.rewardAmount != null && conversionReferral.rewardAmount > 0) {
      await logger.info('Reward created', 'api.reward.created', {
        appId: app.id,
        referralId: conversionReferral.id,
        conversionId: conversion.id,
        level: 1,
        amount: conversionReferral.rewardAmount,
      });
    }

    await triggerWebhook(app.id, 'REFERRAL_CONVERTED', {
      referralId: conversionReferral.id,
      referralCode: originalReferral.referralCode, // Original code
      conversionReferralCode: conversionReferral.referralCode, // Conversion record code
      conversionId: conversion.id,
      rewardAmount: conversionReferral.rewardAmount,
      convertedAt: conversionReferral.convertedAt,
      campaignId: originalReferral.campaignId,
      refereeId, // Who converted
    });

    if (status === 'CONVERTED') {
      await triggerWebhook(app.id, 'REWARD_CREATED', {
        referralId: conversionReferral.id,
        referrerId: originalReferral.referrerId, // Original referrer (User A)
        rewardAmount: conversionReferral.rewardAmount,
        campaignId: originalReferral.campaignId,
      });
    }

    // Send notification to partner
    try {
      const partner = await prisma.partner.findUnique({
        where: { id: app.partnerId },
        include: { User: true },
      });

      if (partner?.User) {
        await notifyReferralConversion(partner.User.id, {
          code: originalReferral.referralCode,
          rewardAmount: conversionReferral.rewardAmount || undefined,
          campaignName: campaign.name,
        });
      }
    } catch (error) {
      console.error('[Notification] Error sending conversion notification:', error);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      success: true,
      referralId: conversionReferral.id,
      originalReferralCode: originalReferral.referralCode,
      conversionId: conversion.id,
      rewardAmount: conversionReferral.rewardAmount,
      status: conversionReferral.status,
      refereeId, // Who converted
      referrerId: originalReferral.referrerId, // Who gets credit (User A)
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error tracking conversion:', error);
    
    // Handle specific transaction errors
    if (error.message === 'DUPLICATE_CONVERSION') {
      return NextResponse.json(
        { error: 'This user has already converted with this referral code' },
        { status: 400 }
      );
    }
    
    if (error.message === 'FAILED_TO_GENERATE_CONVERSION_CODE') {
      return NextResponse.json(
        { error: 'Failed to generate unique conversion code. Please try again.' },
        { status: 500 }
      );
    }
    
    // Handle Prisma unique constraint violation (database-level duplicate check)
    if (error.code === 'P2002' && error.meta?.target?.includes('originalReferralCode')) {
      return NextResponse.json(
        { error: 'This user has already converted with this referral code' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

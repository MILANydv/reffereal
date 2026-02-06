import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateApiKey, logApiUsage } from '@/lib/api-middleware';
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

    let rewardAmount = 0;
    const campaign = referral.Campaign;

    if (campaign.rewardModel === 'FIXED_CURRENCY') {
      rewardAmount = campaign.rewardValue;
    } else if (campaign.rewardModel === 'PERCENTAGE' && amount) {
      rewardAmount = (amount * campaign.rewardValue) / 100;
    }

    if (campaign.rewardCap && rewardAmount > campaign.rewardCap) {
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

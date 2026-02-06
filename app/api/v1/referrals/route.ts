import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateApiKey, logApiUsage } from '@/lib/api-middleware';
import { generateReferralCode } from '@/lib/api-key';
import { detectFraudEnhanced } from '@/lib/fraud-detection-enhanced';
import { triggerWebhook } from '@/lib/webhooks';
import { notifyReferralCodeGenerated } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  const authResult = await authenticateApiKey(request);

  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { app } = authResult;

  try {
    const body = await request.json();
    const { campaignId, referrerId, refereeId } = body;

    if (!campaignId || !referrerId) {
      return NextResponse.json(
        { error: 'campaignId and referrerId are required' },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { App: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.appId !== app.id) {
      return NextResponse.json(
        { error: 'Campaign does not belong to this app' },
        { status: 403 }
      );
    }

    if (campaign.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Campaign is not active' }, { status: 400 });
    }

    const referralCode = generateReferralCode();
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') || null;
    const userAgent = request.headers.get('user-agent') || null;
    const acceptLanguage = request.headers.get('accept-language') || null;

    const fraudCheck = await detectFraudEnhanced(
      app.id,
      referralCode,
      referrerId,
      refereeId || null,
      ipAddress,
      userAgent,
      acceptLanguage
    );

    // Generate device fingerprint
    const { generateDeviceFingerprint } = await import('@/lib/fraud-detection-enhanced');
    const deviceFingerprint = userAgent ? generateDeviceFingerprint(userAgent, ipAddress, acceptLanguage) : null;

    const referral = await prisma.referral.create({
      data: {
        Campaign: { connect: { id: campaignId } },
        referrerId,
        refereeId,
        referralCode,
        status: fraudCheck.isFraud ? 'FLAGGED' : 'PENDING',
        ipAddress,
        isFlagged: fraudCheck.isFraud,
        deviceFingerprint,
        userAgent,
      },
    });

    await logApiUsage(app.id, '/api/v1/referrals', request);

    await triggerWebhook(app.id, 'REFERRAL_CREATED', {
      referralId: referral.id,
      referralCode: referral.referralCode,
      referrerId,
      refereeId,
      campaignId,
    });

    // Send notification to partner
    try {
      const partner = await prisma.partner.findUnique({
        where: { id: app.partnerId },
        include: { User: true },
      });

      if (partner?.User) {
        // Standard notification
        await notifyReferralCodeGenerated(partner.User.id, {
          code: referral.referralCode,
          campaignName: campaign.name,
        });

        // Fraud notification if applicable
        if (fraudCheck.isFraud) {
          const { notifyPartnerFraud } = await import('@/lib/notifications');
          await notifyPartnerFraud(partner.User.id, {
            referralCode: referral.referralCode,
            appName: app.name,
            fraudType: fraudCheck.reasons[0] || 'Suspected Fraud',
          });
        }
      }
    } catch (error) {
      console.error('[Notification] Error sending referral notifications:', error);
      // Don't fail the request if notification fails
    }

    // Notify Admins if fraud
    if (fraudCheck.isFraud) {
      try {
        const { notifyAdminFraud } = await import('@/lib/notifications');
        await notifyAdminFraud(
          'Referral Creation Fraud Detected',
          `High risk referral created in app "${app.name}". Code: "${referral.referralCode}". Reason: ${fraudCheck.reasons.join(', ')}`,
          {
            appId: app.id,
            referralCode: referral.referralCode,
            riskScore: fraudCheck.riskScore,
            reasons: fraudCheck.reasons
          }
        );
      } catch (err) {
        console.error('Error notifying admins of fraud:', err);
      }
    }

    return NextResponse.json({
      referralCode: referral.referralCode,
      referralId: referral.id,
      status: referral.status,
      ...(fraudCheck.isFraud && {
        warning: 'Referral flagged for review',
        reasons: fraudCheck.reasons,
        riskScore: fraudCheck.riskScore
      }),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating referral:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

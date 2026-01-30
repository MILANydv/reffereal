import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateApiKey, logApiUsage } from '@/lib/api-middleware';
import { generateReferralCode } from '@/lib/api-key';
import { detectFraud } from '@/lib/fraud-detection';
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
      include: { app: true },
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
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;

    const fraudCheck = await detectFraud(app.id, referralCode, referrerId, refereeId || null, ipAddress);

    const referral = await prisma.referral.create({
      data: {
        campaignId,
        referrerId,
        refereeId,
        referralCode,
        status: fraudCheck.isFraud ? 'FLAGGED' : 'PENDING',
        ipAddress,
        isFlagged: fraudCheck.isFraud,
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
        include: { user: true },
      });
      
      if (partner?.user) {
        await notifyReferralCodeGenerated(partner.user.id, {
          code: referral.referralCode,
          campaignName: campaign.name,
        });
      }
    } catch (error) {
      console.error('[Notification] Error sending referral code notification:', error);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      referralCode: referral.referralCode,
      referralId: referral.id,
      status: referral.status,
      ...(fraudCheck.isFraud && { warning: 'Referral flagged for review', reasons: fraudCheck.reasons }),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating referral:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

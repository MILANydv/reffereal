import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateApiKey, logApiUsage } from '@/lib/api-middleware';
import { generateReferralCode } from '@/lib/api-key';

export async function POST(request: NextRequest) {
  const authResult = await authenticateApiKey(request);
  
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { app } = authResult;

  try {
    const body = await request.json();
    const { campaignId, referrerId } = body;

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

    const referral = await prisma.referral.create({
      data: {
        campaignId,
        referrerId,
        referralCode,
        status: 'PENDING',
      },
    });

    await logApiUsage(app.id, '/api/v1/referrals', request);

    return NextResponse.json({
      referralCode: referral.referralCode,
      referralId: referral.id,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating referral:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

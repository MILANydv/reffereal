import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateApiKey, logApiUsage } from '@/lib/api-middleware';
import { triggerWebhook } from '@/lib/webhooks';

export async function POST(request: NextRequest) {
  const authResult = await authenticateApiKey(request);
  
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { app } = authResult;

  try {
    const body = await request.json();
    const { referralCode } = body;

    if (!referralCode) {
      return NextResponse.json(
        { error: 'referralCode is required' },
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

    const updatedReferral = await prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: 'CLICKED',
        clickedAt: new Date(),
      },
    });

    await logApiUsage(app.id, '/api/v1/clicks', request);

    await triggerWebhook(app.id, 'REFERRAL_CLICKED', {
      referralId: updatedReferral.id,
      referralCode: updatedReferral.referralCode,
      clickedAt: updatedReferral.clickedAt,
      campaignId: referral.campaignId,
    });

    return NextResponse.json({
      success: true,
      referralId: updatedReferral.id,
      status: updatedReferral.status,
    });
  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

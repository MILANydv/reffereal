import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateApiKey, logApiUsage } from '@/lib/api-middleware';
import { triggerWebhook } from '@/lib/webhooks';
import { getClientIp } from '@/lib/client-ip';

export async function POST(request: NextRequest) {
  const authResult = await authenticateApiKey(request);
  
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { app } = authResult;

  try {
    const body = await request.json();
    const { referralCode, refereeId } = body;

    if (!referralCode) {
      return NextResponse.json(
        { error: 'referralCode is required' },
        { status: 400 }
      );
    }

    // Find the original referral code generation record (not conversion referrals)
    const referral = await prisma.referral.findFirst({
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

    if (!referral) {
      return NextResponse.json({ error: 'Referral code not found' }, { status: 404 });
    }

    if (referral.Campaign.appId !== app.id) {
      return NextResponse.json(
        { error: 'Referral does not belong to this app' },
        { status: 403 }
      );
    }

    // Capture client IP and device fingerprint for fraud detection
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || null;
    const acceptLanguage = request.headers.get('accept-language') || null;

    // Generate device fingerprint
    const { generateDeviceFingerprint } = await import('@/lib/fraud-detection-enhanced');
    const deviceFingerprint = userAgent ? generateDeviceFingerprint(userAgent, ipAddress, acceptLanguage) : null;

    // Create a Click record instead of updating the Referral record
    const click = await prisma.click.create({
      data: {
        referralCode,
        refereeId: refereeId || null,
        ipAddress: ipAddress || null,
        deviceFingerprint: deviceFingerprint || null,
        userAgent: userAgent || null,
        campaignId: referral.campaignId,
        referrerId: referral.referrerId, // Original referrer (User A)
      },
    });

    await logApiUsage(app.id, '/api/v1/clicks', request);

    await triggerWebhook(app.id, 'REFERRAL_CLICKED', {
      referralId: referral.id,
      referralCode: referral.referralCode,
      clickId: click.id,
      clickedAt: click.clickedAt,
      campaignId: referral.campaignId,
      refereeId: refereeId || null,
    });

    return NextResponse.json({
      success: true,
      clickId: click.id,
      referralCode: referral.referralCode,
      clickedAt: click.clickedAt,
    });
  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

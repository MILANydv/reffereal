import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createManualFraudFlag } from '@/lib/fraud-detection-enhanced';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || 'Manually flagged by partner';

    // Verify referral belongs to partner's app
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
      },
    });

    if (!referral) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 });
    }

    if (referral.Campaign.App.partnerId !== session.user.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Mark referral as flagged/suspicious
    await prisma.referral.update({
      where: { id },
      data: {
        isFlagged: true,
        status: 'FLAGGED',
        flaggedBy: session.user.id,
        flaggedAt: new Date(),
      },
    });

    // Create fraud flag and notify admins
    await createManualFraudFlag(
      referral.Campaign.App.id,
      referral.referralCode,
      session.user.id,
      `Partner manually flagged: ${reason}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking referral as suspicious:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

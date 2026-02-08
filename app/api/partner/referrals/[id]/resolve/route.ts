import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { resolveFraudFlag } from '@/lib/fraud-detection';

/**
 * POST /api/partner/referrals/[id]/resolve
 * Resolve fraud flag(s) for a referral and clear its flagged state. Partner must own the app.
 * Restores referral status to CONVERTED / CLICKED / PENDING based on conversion/click state.
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
      },
    });

    if (!referral) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 });
    }

    if (referral.Campaign.App.partnerId !== session.user.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const appId = referral.Campaign.App.id;

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

    await prisma.referral.update({
      where: { id },
      data: {
        isFlagged: false,
        flaggedBy: null,
        flaggedAt: null,
        status: newStatus,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resolving referral flag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateApiKey, logApiUsage } from '@/lib/api-middleware';

/**
 * GET /api/v1/rewards/[rewardId]
 * Get a single reward detail including discount code and fulfillment info.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ rewardId: string }> }
) {
  const authResult = await authenticateApiKey(request);

  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { app } = authResult;
  const { rewardId } = await params;

  try {
    const reward = await prisma.reward.findFirst({
      where: { id: rewardId, appId: app.id },
      select: {
        id: true,
        userId: true,
        amount: true,
        currency: true,
        status: true,
        level: true,
        fulfillmentType: true,
        fulfillmentReference: true,
        discountCode: true,
        expiresAt: true,
        claimedAt: true,
        paidAt: true,
        payoutReference: true,
        createdAt: true,
        updatedAt: true,
        Referral: {
          select: {
            id: true,
            referralCode: true,
            referrerId: true,
            refereeId: true,
            campaignId: true,
            Campaign: { select: { name: true, payoutType: true } },
          },
        },
        Conversion: {
          select: {
            id: true,
            amount: true,
            createdAt: true,
          },
        },
      },
    });

    if (!reward) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 });
    }

    await logApiUsage(app.id, `/api/v1/rewards/${rewardId}`, request);

    return NextResponse.json({ reward });
  } catch (error) {
    console.error('Error fetching reward:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

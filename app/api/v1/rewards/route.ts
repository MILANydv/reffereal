import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateApiKey, logApiUsage } from '@/lib/api-middleware';
import { logger } from '@/lib/logger';

/**
 * GET /api/v1/rewards
 * List rewards for the authenticated app.
 * Query: userId, status, fulfillmentType, page, limit
 */
export async function GET(request: NextRequest) {
  const authResult = await authenticateApiKey(request);

  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { app } = authResult;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const status = searchParams.get('status');
  const fulfillmentType = searchParams.get('fulfillmentType');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25')));

  try {
    const where: Record<string, unknown> = { appId: app.id };

    if (userId) where.userId = userId;
    if (status && ['PENDING', 'APPROVED', 'PAID', 'CANCELLED'].includes(status)) {
      where.status = status;
    }
    if (fulfillmentType && ['CASH', 'STORE_CREDIT', 'IN_APP_DISCOUNT', 'COUPON_CODE', 'POINTS', 'OTHER'].includes(fulfillmentType)) {
      where.fulfillmentType = fulfillmentType;
    }

    const [total, rewards] = await Promise.all([
      prisma.reward.count({ where }),
      prisma.reward.findMany({
        where,
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
          Referral: {
            select: {
              referralCode: true,
              campaignId: true,
              Campaign: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    await logApiUsage(app.id, '/api/v1/rewards', request);
    await logger.info('Rewards listed', 'api.v1.rewards', { appId: app.id, total });

    return NextResponse.json({
      rewards,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Error listing rewards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

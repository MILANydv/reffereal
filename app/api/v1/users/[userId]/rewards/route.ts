import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateApiKey, logApiUsage } from '@/lib/api-middleware';

/**
 * GET /api/v1/users/[userId]/rewards
 * List rewards for a user (API key auth, scoped to app).
 * Query: status (optional), page, limit, campaignId (optional).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const authResult = await authenticateApiKey(request);

  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { app } = authResult;
  const { userId } = await params;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const campaignId = searchParams.get('campaignId');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25')));

  try {
    const where: {
      userId: string;
      appId: string;
      status?: string;
      Referral?: { campaignId?: string };
    } = {
      userId,
      appId: app.id,
    };

    if (status && ['PENDING', 'APPROVED', 'PAID', 'CANCELLED'].includes(status)) {
      where.status = status as 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';
    }
    if (campaignId) {
      where.Referral = { campaignId };
    }

    let total = 0;
    let rewards: any[] = [];
    try {
      [total, rewards] = await Promise.all([
        prisma.reward.count({ where }),
        prisma.reward.findMany({
          where,
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            level: true,
            paidAt: true,
            payoutReference: true,
            fulfillmentType: true,
            fulfillmentReference: true,
            createdAt: true,
            Referral: { select: { referralCode: true, campaignId: true, Campaign: { select: { name: true } } } },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);
    } catch (_err) {
      // Reward table may not exist yet (migration not applied); return empty list
    }

    await logApiUsage(app.id, `/api/v1/users/${userId}/rewards`, request);

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
    console.error('Error fetching user rewards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    const campaignId = searchParams.get('campaignId');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 100);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: {
      App: { partnerId: string; id?: string };
      Referral?: { campaignId?: string };
      status?: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';
      userId?: string;
      createdAt?: { gte?: Date; lte?: Date };
    } = {
      App: {
        partnerId: session.user.partnerId,
        ...(appId ? { id: appId } : {}),
      },
    };

    if (campaignId) {
      where.Referral = { campaignId };
    }
    if (status && status !== 'all') {
      where.status = status as 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';
    }
    if (userId) {
      where.userId = userId;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    let totalItems = 0;
    let rewards: any[] = [];
    let rewardTableExists = false;
    try {
      [totalItems, rewards] = await Promise.all([
        prisma.reward.count({ where }),
        prisma.reward.findMany({
          where,
          include: {
            Referral: {
              select: {
                referralCode: true,
                campaignId: true,
                createdAt: true,
                Campaign: {
                  select: { name: true },
                },
              },
            },
            App: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);
      rewardTableExists = true;
    } catch (_err) {
      // Reward table may not exist yet (migration not applied)
    }

    // Backfill: create Reward rows for CONVERTED referrals that don't have one yet (e.g. table was added later)
    if (rewardTableExists && totalItems === 0) {
      try {
        const conversionsWithoutReward = await prisma.conversion.findMany({
          where: {
            Referral: {
              status: 'CONVERTED',
              rewardAmount: { not: null, gt: 0 },
              Campaign: {
                App: {
                  partnerId: session.user.partnerId,
                  ...(appId ? { id: appId } : {}),
                },
              },
            },
            Reward: null,
          },
          include: {
            Referral: {
              select: {
                id: true,
                referrerId: true,
                rewardAmount: true,
                campaignId: true,
                Campaign: { select: { appId: true } },
              },
            },
          },
        });
        for (const conv of conversionsWithoutReward) {
          const ref = conv.Referral;
          const appIdForReward = ref.Campaign?.appId;
          if (!appIdForReward || ref.rewardAmount == null || ref.rewardAmount <= 0) continue;
          await prisma.reward.create({
            data: {
              referralId: ref.id,
              conversionId: conv.id,
              appId: appIdForReward,
              userId: ref.referrerId,
              amount: ref.rewardAmount,
              currency: 'USD',
              status: 'PENDING',
              level: 1,
            },
          });
        }
        if (conversionsWithoutReward.length > 0) {
          [totalItems, rewards] = await Promise.all([
            prisma.reward.count({ where }),
            prisma.reward.findMany({
              where,
              include: {
                Referral: {
                  select: {
                    referralCode: true,
                    campaignId: true,
                    createdAt: true,
                    Campaign: { select: { name: true } },
                  },
                },
                App: { select: { id: true, name: true } },
              },
              orderBy: { createdAt: 'desc' },
              skip: (page - 1) * limit,
              take: limit,
            }),
          ]);
        }
      } catch (backfillErr) {
        console.warn('Rewards backfill skipped or failed:', backfillErr);
      }
    }

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return NextResponse.json({
      rewards,
      pagination: { page, limit, totalItems, totalPages },
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

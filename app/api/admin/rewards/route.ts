import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');
    const appId = searchParams.get('appId');
    const campaignId = searchParams.get('campaignId');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 100);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: {
      App: { partnerId?: string; id?: string };
      Referral?: { campaignId?: string };
      status?: string;
      userId?: string;
      createdAt?: { gte?: Date; lte?: Date };
    } = {
      App: {
        ...(partnerId ? { partnerId } : {}),
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
                Campaign: { select: { name: true } },
              },
            },
            App: {
              select: {
                id: true,
                name: true,
                Partner: {
                  select: {
                    id: true,
                    companyName: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);
    } catch (_err) {
      // Reward table may not exist yet (migration not applied)
    }

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return NextResponse.json({
      rewards,
      pagination: { page, limit, totalItems, totalPages },
    });
  } catch (error) {
    console.error('Error fetching admin rewards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

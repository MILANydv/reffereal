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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const statusFilter = searchParams.get('status');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const partnerId = session.user.partnerId;

    // Build where clause - if appId is provided, filter to that app; otherwise show all apps (platform-level)
    const whereClause: any = {
      campaign: {
        app: {
          partnerId,
          ...(appId ? { id: appId } : {}),
        },
      },
    };

    if (campaignId) {
      whereClause.campaign.id = campaignId;
    }

    if (statusFilter && statusFilter !== 'all') {
      whereClause.status = statusFilter;
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate);
      }
    }

    if (search) {
      whereClause.OR = [
        { referralCode: { contains: search, mode: 'insensitive' } },
        { referrerId: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const totalItems = await prisma.referral.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / limit);

    const referrals = await prisma.referral.findMany({
      where: whereClause,
      include: {
        campaign: {
          include: {
            app: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      referrals,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user.partnerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const statusFilter = searchParams.get('status');
    const search = searchParams.get('search');

    if (!appId) {
      return NextResponse.json(
        { error: 'appId is required' },
        { status: 400 }
      );
    }

    const app = await prisma.app.findFirst({
      where: {
        id: appId,
        partnerId: session.user.partnerId,
      },
    });

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    const whereClause: any = { appId };
    
    if (statusFilter && statusFilter !== 'all') {
      whereClause.status = statusFilter;
    }

    if (search) {
      whereClause.name = { contains: search, mode: 'insensitive' };
    }

    // Get total count
    const totalItems = await prisma.campaign.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / limit);

    const campaigns = await prisma.campaign.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            Referral: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      campaigns,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user.partnerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      appId,
      name,
      referralType,
      rewardModel,
      rewardValue,
      rewardCap,
      firstTimeUserOnly,
      startDate,
      endDate,
      conversionWindow,
      rewardExpiration,
      level1Reward,
      level2Reward,
      level1Cap,
      level2Cap,
      tierConfig,
      referralCodePrefix,
      referralCodeFormat,
    } = body;

    if (!appId || !name || !referralType || !rewardModel || rewardValue === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return NextResponse.json(
        { error: 'endDate must be on or after startDate' },
        { status: 400 }
      );
    }

    const app = await prisma.app.findFirst({
      where: {
        id: appId,
        partnerId: session.user.partnerId,
      },
    });

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        App: { connect: { id: appId } },
        name,
        referralType,
        rewardModel,
        rewardValue,
        rewardCap: rewardCap != null ? rewardCap : undefined,
        firstTimeUserOnly: firstTimeUserOnly ?? true,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        conversionWindow: conversionWindow != null ? Number(conversionWindow) : undefined,
        rewardExpiration: rewardExpiration != null ? Number(rewardExpiration) : undefined,
        level1Reward: level1Reward != null ? Number(level1Reward) : undefined,
        level2Reward: level2Reward != null ? Number(level2Reward) : undefined,
        level1Cap: level1Cap != null ? Number(level1Cap) : undefined,
        level2Cap: level2Cap != null ? Number(level2Cap) : undefined,
        tierConfig: typeof tierConfig === 'string' ? tierConfig : (tierConfig ? JSON.stringify(tierConfig) : undefined),
        referralCodePrefix: referralCodePrefix != null && referralCodePrefix !== '' ? String(referralCodePrefix).trim() : undefined,
        referralCodeFormat: referralCodeFormat != null && ['RANDOM', 'USERNAME', 'EMAIL_PREFIX'].includes(referralCodeFormat) ? referralCodeFormat : undefined,
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const campaigns = await prisma.campaign.findMany({
      where: { appId },
      include: {
        _count: {
          select: {
            referrals: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(campaigns);
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
    } = body;

    if (!appId || !name || !referralType || !rewardModel || rewardValue === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
        appId,
        name,
        referralType,
        rewardModel,
        rewardValue,
        rewardCap,
        firstTimeUserOnly: firstTimeUserOnly ?? true,
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

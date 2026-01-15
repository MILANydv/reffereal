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
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!appId) {
      return NextResponse.json(
        { error: 'appId is required' },
        { status: 400 }
      );
    }

    // Verify app belongs to partner
    const app = await prisma.app.findFirst({
      where: {
        id: appId,
        partnerId: session.user.partnerId,
      },
    });

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    const whereClause: {
      campaign: { appId: string; id?: string };
    } = {
      campaign: { appId },
    };

    if (campaignId) {
      whereClause.campaign.id = campaignId;
    }

    const referrals = await prisma.referral.findMany({
      where: whereClause,
      include: {
        campaign: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ referrals });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


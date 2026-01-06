import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnerId = session.user.partnerId;
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');

    const whereClause: { 
      app: { partnerId: string; id?: string }; 
      status: 'ACTIVE' 
    } = {
      app: { partnerId },
      status: 'ACTIVE',
    };

    if (appId) {
      whereClause.app.id = appId;
    }

    const campaigns = await prisma.campaign.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            referrals: true,
          },
        },
        referrals: {
          where: {
            status: 'CONVERTED',
          },
          select: {
            rewardAmount: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    const activeCampaigns = campaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      totalReferrals: campaign._count.referrals,
      totalRewardCost: campaign.referrals.reduce((sum, r) => sum + (r.rewardAmount || 0), 0),
    }));

    return NextResponse.json({ campaigns: activeCampaigns });
  } catch (error) {
    console.error('Active campaigns error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

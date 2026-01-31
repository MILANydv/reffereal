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
      App: { partnerId: string; id?: string }; 
      status: 'ACTIVE' 
    } = {
      App: { partnerId },
      status: 'ACTIVE',
    };

    if (appId) {
      whereClause.App.id = appId;
    }

    const campaigns = await prisma.campaign.findMany({
      where: whereClause,
      include: {
        App: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            Referral: true,
          },
        },
        Referral: {
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
      totalReferrals: campaign._count.Referral,
      totalRewardCost: campaign.Referral?.reduce((sum, r) => sum + (r.rewardAmount || 0), 0) || 0,
      app: {
        id: campaign.App.id,
        name: campaign.App.name,
      },
    }));

    return NextResponse.json({ campaigns: activeCampaigns });
  } catch (error) {
    console.error('Active campaigns error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

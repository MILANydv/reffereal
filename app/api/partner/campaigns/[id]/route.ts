import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || !session.user.partnerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        app: {
          partnerId: session.user.partnerId,
        },
      },
      include: {
        app: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            referrals: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Get referral statistics
    const [totalReferrals, totalClicks, totalConversions, totalReward] = await Promise.all([
      prisma.referral.count({ where: { campaignId: campaign.id } }),
      prisma.referral.count({
        where: {
          campaignId: campaign.id,
          status: { in: ['CLICKED', 'CONVERTED'] },
        },
      }),
      prisma.referral.count({
        where: { campaignId: campaign.id, status: 'CONVERTED' },
      }),
      prisma.referral.aggregate({
        where: { campaignId: campaign.id, status: 'CONVERTED' },
        _sum: { rewardAmount: true },
      }),
    ]);

    const clickRate = totalReferrals > 0 ? (totalClicks / totalReferrals) * 100 : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    // Get recent referrals
    const recentReferrals = await prisma.referral.findMany({
      where: { campaignId: campaign.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        conversions: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Get daily stats for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const allReferrals = await prisma.referral.findMany({
      where: {
        campaignId: campaign.id,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
        convertedAt: true,
        status: true,
      },
    });

    // Format daily data
    const dailyStats = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const referrals = allReferrals.filter(r => {
        const rDate = new Date(r.createdAt);
        rDate.setHours(0, 0, 0, 0);
        return rDate.getTime() === date.getTime();
      }).length;
      
      const conversions = allReferrals.filter(r => {
        if (!r.convertedAt || r.status !== 'CONVERTED') return false;
        const cDate = new Date(r.convertedAt);
        cDate.setHours(0, 0, 0, 0);
        return cDate.getTime() === date.getTime();
      }).length;

      dailyStats.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        referrals,
        conversions,
      });
    }

    return NextResponse.json({
      ...campaign,
      analytics: {
        totalReferrals,
        totalClicks,
        totalConversions,
        clickRate: Number(clickRate.toFixed(2)),
        conversionRate: Number(conversionRate.toFixed(2)),
        totalRewardValue: totalReward._sum.rewardAmount || 0,
        averageReward: totalConversions > 0 ? (totalReward._sum.rewardAmount || 0) / totalConversions : 0,
        revenue: totalConversions * 45, // $45 per conversion
      },
      recentReferrals: recentReferrals.map(r => ({
        id: r.id,
        referralCode: r.referralCode,
        referrerId: r.referrerId,
        status: r.status,
        clickedAt: r.clickedAt,
        convertedAt: r.convertedAt,
        rewardAmount: r.rewardAmount,
        createdAt: r.createdAt.toISOString(),
      })),
      dailyStats,
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify campaign belongs to partner
    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        app: {
          partnerId: session.user.partnerId,
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Delete campaign (referrals will be cascade deleted)
    await prisma.campaign.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


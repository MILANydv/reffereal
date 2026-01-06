import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnerId = session.user.partnerId;

    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        apps: {
          include: {
            campaigns: {
              include: {
                referrals: {
                  include: {
                    conversions: true,
                  },
                },
              },
            },
            apiUsageLogs: {
              where: {
                timestamp: {
                  gte: new Date(new Date().setDate(1)),
                },
              },
            },
          },
        },
        subscription: {
          include: { plan: true },
        },
      },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    const totalApps = partner.apps.length;
    let totalReferrals = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let totalRewards = 0;

    for (const app of partner.apps || []) {
      for (const campaign of app.campaigns || []) {
        totalReferrals += campaign.referrals?.length || 0;
        totalClicks += (campaign.referrals?.filter((r) => r.clickedAt) || []).length;
        totalConversions += (campaign.referrals?.filter((r) => r.convertedAt) || []).length;
        totalRewards += campaign.referrals?.reduce((sum, r) => sum + (r.rewardAmount || 0), 0) || 0;
      }
    }

    const apiUsageCurrent = partner.apps?.reduce((sum, app) => sum + (app.apiUsageLogs?.length || 0), 0) || 0;
    const apiUsageLimit = partner.subscription?.plan.apiLimit || 10000;
    const apiUsagePercentage = (apiUsageCurrent / apiUsageLimit) * 100;

    const recentReferrals = await prisma.referral.findMany({
      where: {
        campaign: {
          app: {
            partnerId,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        campaign: true,
      },
    });

    const recentActivity = recentReferrals.map((referral) => ({
      id: referral.id,
      type: referral.status,
      description: `New referral in ${referral.campaign.name}`,
      timestamp: referral.createdAt.toISOString(),
    }));

    const alerts = [];
    if (apiUsagePercentage >= 80) {
      alerts.push({
        id: 'api-usage-high',
        type: 'warning' as const,
        message: `You've used ${apiUsagePercentage.toFixed(1)}% of your monthly API limit. Consider upgrading your plan.`,
      });
    }

    const fraudFlags = await prisma.fraudFlag.count({
      where: {
        app: { partnerId },
        isResolved: false,
      },
    });

    if (fraudFlags > 0) {
      alerts.push({
        id: 'fraud-alerts',
        type: 'error' as const,
        message: `You have ${fraudFlags} unresolved fraud alert${fraudFlags > 1 ? 's' : ''}. Review them now.`,
      });
    }

    const apiUsageChart = await generateApiUsageChart(partner.apps || []);

    return NextResponse.json({
      totalApps,
      totalReferrals,
      totalClicks,
      totalConversions,
      totalRewards,
      apiUsage: {
        current: apiUsageCurrent,
        limit: apiUsageLimit,
        percentage: apiUsagePercentage,
      },
      apiUsageChart,
      recentActivity,
      alerts,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateApiUsageChart(apps: Array<{ id: string; apiUsageLogs?: Array<{ timestamp: Date }> }>) {
  const dailyMap = new Map<string, number>();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dailyMap.set(dateStr, 0);
  }

  const logs = await prisma.apiUsageLog.findMany({
    where: {
      appId: { in: apps.map(app => app.id) },
      timestamp: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  logs.forEach(log => {
    const dateStr = log.timestamp.toISOString().split('T')[0];
    if (dailyMap.has(dateStr)) {
      dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + 1);
    }
  });

  return Array.from(dailyMap.entries()).map(([date, value]) => {
    const d = new Date(date);
    return {
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      value,
    };
  });
}

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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const partnerId = session.user.partnerId;
    
    // Build date filter
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    const appsWhere: any = { partnerId };
    if (appId) {
      appsWhere.id = appId;
    }

    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        apps: {
          where: appsWhere,
          include: {
            campaigns: {
              include: {
                referrals: {
                  where: dateFilter.gte || dateFilter.lte ? {
                    createdAt: dateFilter,
                  } : undefined,
                  include: {
                    conversions: true,
                  },
                },
              },
            },
            apiUsageLogs: {
              where: {
                timestamp: dateFilter.gte || dateFilter.lte ? dateFilter : {
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

    const recentReferralsWhere: any = {
      campaign: {
        app: appId ? { partnerId, id: appId } : { partnerId },
      },
    };
    if (dateFilter.gte || dateFilter.lte) {
      recentReferralsWhere.createdAt = dateFilter;
    }

    const recentReferrals = await prisma.referral.findMany({
      where: recentReferralsWhere,
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        campaign: {
          include: {
            app: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const recentActivity = recentReferrals.map((referral) => ({
      id: referral.id,
      type: referral.status,
      description: `New referral in ${referral.campaign.name}`,
      timestamp: referral.createdAt.toISOString(),
      app: {
        id: referral.campaign.app.id,
        name: referral.campaign.app.name,
      },
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

    const apiUsageChart = await generateApiUsageChart(
      partner.apps || [],
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

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

async function generateApiUsageChart(
  apps: Array<{ id: string; name: string; apiUsageLogs?: Array<{ timestamp: Date }> }>,
  startDate?: Date,
  endDate?: Date
) {
  // Determine date range
  const rangeStart = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const rangeEnd = endDate || new Date();
  const daysDiff = Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / (24 * 60 * 60 * 1000));
  const daysToShow = Math.min(Math.max(daysDiff, 7), 90); // Show between 7-90 days
  
  // Initialize date map for all dates
  const dateKeys: string[] = [];
  for (let i = daysToShow - 1; i >= 0; i--) {
    const date = new Date(rangeEnd);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dateKeys.push(dateStr);
  }

  // Get logs for all apps
  const logsWhere: any = {
    appId: { in: apps.map(app => app.id) },
  };
  
  if (startDate || endDate) {
    logsWhere.timestamp = {};
    if (startDate) logsWhere.timestamp.gte = startDate;
    if (endDate) logsWhere.timestamp.lte = endDate;
  } else {
    logsWhere.timestamp = {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    };
  }

  const logs = await prisma.apiUsageLog.findMany({
    where: logsWhere,
    include: {
      app: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Create a map for each app's daily usage
  const appDailyMap = new Map<string, Map<string, number>>();
  apps.forEach(app => {
    appDailyMap.set(app.id, new Map());
    dateKeys.forEach(dateStr => {
      appDailyMap.get(app.id)!.set(dateStr, 0);
    });
  });

  // Count logs per app per day
  logs.forEach(log => {
    const dateStr = log.timestamp.toISOString().split('T')[0];
    const appMap = appDailyMap.get(log.appId);
    if (appMap && appMap.has(dateStr)) {
      appMap.set(dateStr, (appMap.get(dateStr) || 0) + 1);
    }
  });

  // Generate chart data with one line per app
  const chartData = dateKeys.map((dateStr) => {
    const d = new Date(dateStr);
    const format = daysToShow > 30 
      ? { month: 'short', day: 'numeric' }
      : { weekday: 'short' };
    
    const dataPoint: any = {
      name: d.toLocaleDateString('en-US', format),
      date: dateStr,
    };

    // Add value for each app
    apps.forEach(app => {
      const appMap = appDailyMap.get(app.id);
      dataPoint[app.name] = appMap?.get(dateStr) || 0;
    });

    return dataPoint;
  });

  return {
    data: chartData,
    apps: apps.map(app => ({ id: app.id, name: app.name })),
  };
}

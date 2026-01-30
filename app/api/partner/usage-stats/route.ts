import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateMonthlyUsage } from '@/lib/billing';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnerId = session.user.partnerId;
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');

    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        subscription: {
          include: { plan: true },
        },
        apps: {
          include: {
            apiUsageLogs: {
              where: {
                timestamp: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
              },
              orderBy: { timestamp: 'desc' },
            },
          },
        },
      },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // If appId is provided, filter to that app; otherwise show all apps (platform-level)
    let apps = partner.apps;
    if (appId) {
      apps = apps.filter(app => app.id === appId);
    }

    const allLogs = apps.flatMap(app => app.apiUsageLogs);
    
    // Get referral stats for platform-level view
    let referralStats = null;
    if (!appId) {
      // Platform-level: get all referrals across all apps
      const allReferrals = await prisma.referral.findMany({
        where: {
          campaign: {
            app: {
              partnerId,
            },
          },
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        include: {
          campaign: {
            select: {
              appId: true,
            },
          },
        },
      });

      const totalReferrals = allReferrals.length;
      const totalClicks = allReferrals.filter(r => r.clickedAt).length;
      const totalConversions = allReferrals.filter(r => r.convertedAt).length;
      const totalRewards = allReferrals.reduce((sum, r) => sum + (r.rewardAmount || 0), 0);

      referralStats = {
        totalReferrals,
        totalClicks,
        totalConversions,
        totalRewards,
        clickRate: totalReferrals > 0 ? ((totalClicks / totalReferrals) * 100).toFixed(1) : '0',
        conversionRate: totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0',
      };
    }

    const dailyUsage = calculateDailyUsage(allLogs);

    const endpointBreakdown = calculateEndpointBreakdown(allLogs);

    const recentLogs = allLogs
      .slice(0, 50)
      .map(log => ({
        id: log.id,
        endpoint: log.endpoint,
        timestamp: log.timestamp.toISOString(),
        ipAddress: log.ipAddress,
        status: '200',
      }));

    const usage = await calculateMonthlyUsage(partnerId);

    return NextResponse.json({
      apiUsage: {
        current: usage.totalApiCalls,
        limit: usage.allowedApiCalls,
        overage: usage.overage,
        estimatedCost: usage.totalCost,
        dailyUsage,
      },
      endpointBreakdown,
      recentLogs,
      referralStats, // Include referral stats for platform-level view
    });
  } catch (error) {
    console.error('Usage stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateDailyUsage(logs: Array<{ timestamp: Date }>) {
  const dailyMap = new Map<string, number>();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dailyMap.set(dateStr, 0);
  }

  logs.forEach(log => {
    const dateStr = log.timestamp.toISOString().split('T')[0];
    if (dailyMap.has(dateStr)) {
      dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + 1);
    }
  });

  return Array.from(dailyMap.entries())
    .map(([date, calls]) => {
      const d = new Date(date);
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calls,
      };
    });
}

function calculateEndpointBreakdown(logs: Array<{ endpoint: string }>) {
  const endpointMap = new Map<string, number>();
  
  logs.forEach(log => {
    endpointMap.set(log.endpoint, (endpointMap.get(log.endpoint) || 0) + 1);
  });

  const total = logs.length || 1;
  
  const breakdown = Array.from(endpointMap.entries())
    .map(([endpoint, count]) => ({
      endpoint,
      count,
      percentage: ((count / total) * 100).toFixed(1),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const categorized = {
    'Referrals API': 0,
    'Analytics API': 0,
    'Webhooks': 0,
    'Other': 0,
  };

  logs.forEach(log => {
    if (log.endpoint.includes('/referral') || log.endpoint.includes('/conversion') || log.endpoint.includes('/click')) {
      categorized['Referrals API']++;
    } else if (log.endpoint.includes('/stats') || log.endpoint.includes('/analytics')) {
      categorized['Analytics API']++;
    } else if (log.endpoint.includes('/webhook')) {
      categorized['Webhooks']++;
    } else {
      categorized['Other']++;
    }
  });

  return {
    byEndpoint: breakdown,
    byCategory: Object.entries(categorized).map(([category, count]) => ({
      category,
      count,
      percentage: ((count / total) * 100).toFixed(1),
    })),
  };
}

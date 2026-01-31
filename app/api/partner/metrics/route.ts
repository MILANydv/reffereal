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
    const period = searchParams.get('period') || '30';
    
    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - daysAgo);

    const [currentPeriod, previousPeriod] = await Promise.all([
      getMetricsForPeriod(partnerId, startDate, new Date()),
      getMetricsForPeriod(partnerId, previousStartDate, startDate),
    ]);

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return NextResponse.json({
      current: currentPeriod,
      previous: previousPeriod,
      changes: {
        referrals: calculateChange(currentPeriod.referrals, previousPeriod.referrals),
        conversions: calculateChange(currentPeriod.conversions, previousPeriod.conversions),
        revenue: calculateChange(currentPeriod.revenue, previousPeriod.revenue),
        apiCalls: calculateChange(currentPeriod.apiCalls, previousPeriod.apiCalls),
      },
    });
  } catch (error) {
    console.error('Metrics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getMetricsForPeriod(partnerId: string, startDate: Date, endDate: Date) {
  const [referrals, conversions, apiCalls] = await Promise.all([
    prisma.referral.count({
      where: {
        Campaign: { App: { partnerId } },
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
    prisma.referral.count({
      where: {
        Campaign: { App: { partnerId } },
        status: 'CONVERTED',
        convertedAt: { gte: startDate, lte: endDate },
      },
    }),
    prisma.apiUsageLog.count({
      where: {
        App: { partnerId },
        timestamp: { gte: startDate, lte: endDate },
      },
    }),
  ]);

  const rewardSum = await prisma.referral.aggregate({
    where: {
      Campaign: { App: { partnerId } },
      status: 'CONVERTED',
      convertedAt: { gte: startDate, lte: endDate },
    },
    _sum: {
      rewardAmount: true,
    },
  });

  const revenue = conversions * 45;

  return {
    referrals,
    conversions,
    revenue,
    rewardCost: rewardSum._sum.rewardAmount || 0,
    apiCalls,
  };
}

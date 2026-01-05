import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateApiKey, logApiUsage } from '@/lib/api-middleware';

export async function GET(request: NextRequest) {
  const authResult = await authenticateApiKey(request);
  
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { app } = authResult;
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get('campaignId');

  try {
    interface WhereClause {
      campaign: {
        appId: string;
      };
      campaignId?: string;
    }

    const whereClause: WhereClause = {
      campaign: {
        appId: app.id,
      },
    };

    if (campaignId) {
      whereClause.campaignId = campaignId;
    }

    const [totalReferrals, totalClicks, totalConversions, totalRewardValue] = await Promise.all([
      prisma.referral.count({ where: whereClause }),
      prisma.referral.count({
        where: { ...whereClause, status: { in: ['CLICKED', 'CONVERTED'] } },
      }),
      prisma.referral.count({
        where: { ...whereClause, status: 'CONVERTED' },
      }),
      prisma.referral.aggregate({
        where: { ...whereClause, status: 'CONVERTED' },
        _sum: { rewardAmount: true },
      }),
    ]);

    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    await logApiUsage(app.id, '/api/v1/stats', request);

    return NextResponse.json({
      totalReferrals,
      totalClicks,
      totalConversions,
      conversionRate: Number(conversionRate.toFixed(2)),
      totalRewardValue: totalRewardValue._sum.rewardAmount || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
      Campaign: {
        appId: string;
      };
      campaignId?: string;
    }

    const whereClause: WhereClause = {
      Campaign: {
        appId: app.id,
      },
    };

    if (campaignId) {
      whereClause.campaignId = campaignId;
    }

    // Count code generation records (original referrals)
    const codeGenerationWhere = {
      ...whereClause,
      isConversionReferral: false,
    };

    // Count clicks from Click table
    const clicksWhere = {
      Campaign: whereClause.Campaign,
    };
    if (campaignId) {
      clicksWhere.campaignId = campaignId;
    }

    // Count conversion referrals
    const conversionsWhere = {
      ...whereClause,
      isConversionReferral: true,
      status: 'CONVERTED',
    };

    const [totalReferrals, totalClicks, totalConversions, totalRewardValue] = await Promise.all([
      prisma.referral.count({ where: codeGenerationWhere }),
      prisma.click.count({ where: clicksWhere }),
      prisma.referral.count({ where: conversionsWhere }),
      prisma.referral.aggregate({
        where: conversionsWhere,
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

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'PARTNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const appId = searchParams.get('appId');
  const campaignId = searchParams.get('campaignId');

  try {
    const partner = await prisma.partner.findFirst({
      where: { userId: session.user.id },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    if (appId) {
      const app = await prisma.app.findFirst({
        where: { id: appId, partnerId: partner.id },
      });

      if (!app) {
        return NextResponse.json({ error: 'App not found' }, { status: 404 });
      }

      if (campaignId) {
        const campaign = await prisma.campaign.findFirst({
          where: { id: campaignId, appId: app.id },
        });

        if (!campaign) {
          return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

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

        return NextResponse.json({
          campaignId: campaign.id,
          campaignName: campaign.name,
          totalReferrals,
          totalClicks,
          totalConversions,
          clickRate: Number(clickRate.toFixed(2)),
          conversionRate: Number(conversionRate.toFixed(2)),
          totalRewardValue: totalReward._sum.rewardAmount || 0,
          averageReward: totalConversions > 0 ? (totalReward._sum.rewardAmount || 0) / totalConversions : 0,
        });
      }

      const campaigns = await prisma.campaign.findMany({
        where: { appId: app.id },
        include: {
          _count: {
            select: { Referral: true },
          },
        },
      });

      const campaignAnalytics = await Promise.all(
        campaigns.map(async (campaign: { id: string; name: string; status: string }) => {
          const [totalReferrals, totalClicks, totalConversions, totalReward] = await Promise.all([
            // Count code generation records (original referrals)
            prisma.referral.count({
              where: {
                campaignId: campaign.id,
                isConversionReferral: false,
              },
            }),
            // Count clicks from Click table
            prisma.click.count({
              where: { campaignId: campaign.id },
            }),
            // Count conversion referrals
            prisma.referral.count({
              where: {
                campaignId: campaign.id,
                isConversionReferral: true,
                status: 'CONVERTED',
              },
            }),
            // Sum rewards from conversion referrals
            prisma.referral.aggregate({
              where: {
                campaignId: campaign.id,
                isConversionReferral: true,
                status: 'CONVERTED',
              },
              _sum: { rewardAmount: true },
            }),
          ]);

          const clickRate = totalReferrals > 0 ? (totalClicks / totalReferrals) * 100 : 0;
          const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

          return {
            campaignId: campaign.id,
            campaignName: campaign.name,
            status: campaign.status,
            totalReferrals,
            totalClicks,
            totalConversions,
            clickRate: Number(clickRate.toFixed(2)),
            conversionRate: Number(conversionRate.toFixed(2)),
            totalRewardValue: totalReward._sum.rewardAmount || 0,
          };
        })
      );

      type CampaignTotal = { totalReferrals: number; totalClicks: number; totalConversions: number; totalRewardValue: number };
      const appTotals = campaignAnalytics.reduce(
        (acc: CampaignTotal, campaign: { totalReferrals: number; totalClicks: number; totalConversions: number; totalRewardValue: number }) => ({
          totalReferrals: acc.totalReferrals + campaign.totalReferrals,
          totalClicks: acc.totalClicks + campaign.totalClicks,
          totalConversions: acc.totalConversions + campaign.totalConversions,
          totalRewardValue: acc.totalRewardValue + campaign.totalRewardValue,
        }),
        { totalReferrals: 0, totalClicks: 0, totalConversions: 0, totalRewardValue: 0 }
      );

      const appClickRate = appTotals.totalReferrals > 0 ? (appTotals.totalClicks / appTotals.totalReferrals) * 100 : 0;
      const appConversionRate = appTotals.totalClicks > 0 ? (appTotals.totalConversions / appTotals.totalClicks) * 100 : 0;

      return NextResponse.json({
        appId: app.id,
        appName: app.name,
        appTotals: {
          ...appTotals,
          clickRate: Number(appClickRate.toFixed(2)),
          conversionRate: Number(appConversionRate.toFixed(2)),
        },
        apiUsage: {
          current: app.currentUsage,
          limit: app.monthlyLimit,
          percentage: (app.currentUsage / app.monthlyLimit) * 100,
        },
        campaigns: campaignAnalytics,
      });
    }

    const apps = await prisma.app.findMany({
      where: { partnerId: partner.id },
    });

    const appAnalytics = await Promise.all(
      apps.map(async (app: { id: string; name: string; currentUsage: number; monthlyLimit: number }) => {
        const [totalReferrals, totalClicks, totalConversions, totalReward] = await Promise.all([
          prisma.referral.count({
            where: { Campaign: { appId: app.id } },
          }),
          prisma.referral.count({
            where: {
              Campaign: { appId: app.id },
              status: { in: ['CLICKED', 'CONVERTED'] },
            },
          }),
          prisma.referral.count({
            where: { Campaign: { appId: app.id }, status: 'CONVERTED' },
          }),
          prisma.referral.aggregate({
            where: { Campaign: { appId: app.id }, status: 'CONVERTED' },
            _sum: { rewardAmount: true },
          }),
        ]);

        const clickRate = totalReferrals > 0 ? (totalClicks / totalReferrals) * 100 : 0;
        const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

        return {
          appId: app.id,
          appName: app.name,
          totalReferrals,
          totalClicks,
          totalConversions,
          clickRate: Number(clickRate.toFixed(2)),
          conversionRate: Number(conversionRate.toFixed(2)),
          totalRewardValue: totalReward._sum.rewardAmount || 0,
          apiUsage: app.currentUsage,
          apiLimit: app.monthlyLimit,
        };
      })
    );

    return NextResponse.json({ apps: appAnalytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

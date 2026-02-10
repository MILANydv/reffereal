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
        App: {
          partnerId: session.user.partnerId,
        },
      },
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
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Get referral statistics using new structure
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

    // Get recent referrals (code generation records)
    const recentReferrals = await prisma.referral.findMany({
      where: {
        campaignId: campaign.id,
        isConversionReferral: false,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        Conversion: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Get daily stats for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get code generation records and conversion referrals for daily stats
    const [codeGenerationRecords, conversionRecords] = await Promise.all([
      prisma.referral.findMany({
        where: {
          campaignId: campaign.id,
          isConversionReferral: false,
          createdAt: { gte: thirtyDaysAgo },
        },
        select: {
          createdAt: true,
        },
      }),
      prisma.referral.findMany({
        where: {
          campaignId: campaign.id,
          isConversionReferral: true,
          status: 'CONVERTED',
          convertedAt: { gte: thirtyDaysAgo },
        },
        select: {
          convertedAt: true,
        },
      }),
    ]);

    // Format daily data
    const dailyStats = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const referrals = codeGenerationRecords.filter(r => {
        const rDate = new Date(r.createdAt);
        rDate.setHours(0, 0, 0, 0);
        return rDate.getTime() === date.getTime();
      }).length;
      
      const conversions = conversionRecords.filter(r => {
        if (!r.convertedAt) return false;
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.partnerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const campaign = await prisma.campaign.findFirst({
    where: {
      id,
      App: { partnerId: session.user.partnerId },
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const {
      name,
      status,
      startDate,
      endDate,
      conversionWindow,
      rewardExpiration,
      rewardValue,
      rewardCap,
      level1Reward,
      level2Reward,
      level1Cap,
      level2Cap,
      tierConfig,
      firstTimeUserOnly,
      referralCodePrefix,
      referralCodeFormat,
      payoutType,
    } = body;

    if (startDate !== undefined && endDate !== undefined && new Date(endDate) < new Date(startDate)) {
      return NextResponse.json(
        { error: 'endDate must be on or after startDate' },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (status !== undefined) data.status = status;
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
    if (conversionWindow !== undefined) data.conversionWindow = conversionWindow == null ? null : Number(conversionWindow);
    if (rewardExpiration !== undefined) data.rewardExpiration = rewardExpiration == null ? null : Number(rewardExpiration);
    if (rewardValue !== undefined) data.rewardValue = Number(rewardValue);
    if (rewardCap !== undefined) data.rewardCap = rewardCap == null ? null : Number(rewardCap);
    if (level1Reward !== undefined) data.level1Reward = level1Reward == null ? null : Number(level1Reward);
    if (level2Reward !== undefined) data.level2Reward = level2Reward == null ? null : Number(level2Reward);
    if (level1Cap !== undefined) data.level1Cap = level1Cap == null ? null : Number(level1Cap);
    if (level2Cap !== undefined) data.level2Cap = level2Cap == null ? null : Number(level2Cap);
    if (tierConfig !== undefined) data.tierConfig = tierConfig == null ? null : (typeof tierConfig === 'string' ? tierConfig : JSON.stringify(tierConfig));
    if (firstTimeUserOnly !== undefined) data.firstTimeUserOnly = firstTimeUserOnly;
    if (referralCodePrefix !== undefined) data.referralCodePrefix = referralCodePrefix == null || referralCodePrefix === '' ? null : String(referralCodePrefix).trim();
    if (referralCodeFormat !== undefined) data.referralCodeFormat = referralCodeFormat == null || !['RANDOM', 'USERNAME', 'EMAIL_PREFIX'].includes(referralCodeFormat) ? null : referralCodeFormat;
    if (payoutType !== undefined) data.payoutType = payoutType == null || !['CASH', 'STORE_CREDIT', 'IN_APP_DISCOUNT', 'COUPON_CODE', 'POINTS', 'OTHER'].includes(payoutType) ? null : payoutType;

    const updated = await prisma.campaign.update({
      where: { id },
      data: data as any,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating campaign:', error);
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
        App: {
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


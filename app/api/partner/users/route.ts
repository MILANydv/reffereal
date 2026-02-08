import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.partnerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const partnerId = session.user.partnerId;

  const { searchParams } = new URL(request.url);
  const appId = searchParams.get('appId');
  const campaignId = searchParams.get('campaignId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '25');
  const search = searchParams.get('search'); // Search by userId (referrerId or refereeId)

  try {
    // Build base where clause scoped to partner's apps
    const baseWhere: any = {
      Campaign: {
        App: {
          partnerId,
          ...(appId ? { id: appId } : {}),
        },
      },
    };

    if (campaignId) {
      baseWhere.Campaign.id = campaignId;
    }

    // Get unique user IDs (referrerIds) from referrals
    const referralsQuery: any = {
      ...baseWhere,
    };

    if (search) {
      referralsQuery.referrerId = { contains: search, mode: 'insensitive' };
    }

    // Get all unique referrerIds
    const allReferrals = await prisma.referral.findMany({
      where: referralsQuery,
      select: {
        referrerId: true,
      },
      distinct: ['referrerId'],
      orderBy: { createdAt: 'desc' },
    });

    const userIds = allReferrals.map((r) => r.referrerId);
    const totalUsers = userIds.length;
    const totalPages = Math.ceil(totalUsers / limit);
    const paginatedUserIds = userIds.slice((page - 1) * limit, page * limit);

    // Get summary stats for each user
    const usersWithStats = await Promise.all(
      paginatedUserIds.map(async (userId) => {
        const [referralsMade, referralsConverted, rewardsEarned] = await Promise.all([
          prisma.referral.count({
            where: {
              ...baseWhere,
              referrerId: userId,
            },
          }),
          prisma.referral.count({
            where: {
              ...baseWhere,
              referrerId: userId,
              status: 'CONVERTED',
            },
          }),
          prisma.referral.aggregate({
            where: {
              ...baseWhere,
              referrerId: userId,
              status: 'CONVERTED',
            },
            _sum: { rewardAmount: true },
          }),
        ]);

        return {
          userId,
          referralsMade,
          referralsConverted,
          rewardsEarned: rewardsEarned._sum.rewardAmount || 0,
        };
      })
    );

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        totalItems: totalUsers,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

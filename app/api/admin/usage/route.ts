import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [
      totalApiCalls,
      apiCallsByApp,
      apiCallsByPartner,
      recentLogs,
      usageByMonth,
    ] = await Promise.all([
      prisma.apiUsageLog.count(),
      
      prisma.apiUsageLog.groupBy({
        by: ['appId'],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 10,
      }),
      
      prisma.app.groupBy({
        by: ['partnerId'],
        _sum: {
          currentUsage: true,
        },
        orderBy: {
          _sum: {
            currentUsage: 'desc',
          },
        },
        take: 10,
      }),
      
      prisma.apiUsageLog.findMany({
        take: 100,
        orderBy: { timestamp: 'desc' },
        include: {
          App: {
            select: {
              name: true,
              Partner: {
                select: {
                  companyName: true,
                  User: {
                    select: {
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      
      prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
        SELECT 
          TO_CHAR("timestamp", 'YYYY-MM') as month,
          COUNT(*)::int as count
        FROM "ApiUsageLog"
        WHERE "timestamp" >= NOW() - INTERVAL '12 months'
        GROUP BY month
        ORDER BY month DESC
      `,
    ]);

    const appDetails = await prisma.app.findMany({
      where: {
        id: { in: apiCallsByApp.map(a => a.appId).filter((id): id is string => id !== null) },
      },
      select: {
        id: true,
        name: true,
        currentUsage: true,
        monthlyLimit: true,
        Partner: {
          select: {
            companyName: true,
            User: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    const partnerDetails = await prisma.partner.findMany({
      where: {
        id: { in: apiCallsByPartner.map(p => p.partnerId).filter((id): id is string => id !== null) },
      },
      select: {
        id: true,
        companyName: true,
        User: {
          select: {
            email: true,
          },
        },
        Subscription: {
          select: {
            PricingPlan: {
              select: {
                type: true,
                apiLimit: true,
              },
            },
          },
        },
      },
    });

    const topApps = apiCallsByApp.map(item => {
      const app = appDetails.find(a => a.id === item.appId);
      return {
        appId: item.appId,
        appName: app?.name || 'Unknown',
        calls: item._count.id || 0,
        currentUsage: app?.currentUsage || 0,
        monthlyLimit: app?.monthlyLimit || 0,
        partner: app?.Partner,
      };
    });

    const topPartners = apiCallsByPartner.map(item => {
      const partner = partnerDetails.find(p => p.id === item.partnerId);
      return {
        partnerId: item.partnerId,
        companyName: partner?.companyName || 'Unknown',
        email: partner?.User.email || 'Unknown',
        usage: item._sum.currentUsage || 0,
        plan: partner?.Subscription?.PricingPlan,
      };
    });

    // Format recent logs
    const formattedRecentLogs = recentLogs.map(log => ({
      id: log.id,
      endpoint: log.endpoint,
      timestamp: log.timestamp.toISOString(),
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      app: log.App ? {
        name: log.App.name,
        partner: log.App.Partner ? {
          companyName: log.App.Partner.companyName,
          email: log.App.Partner.User?.email,
        } : null,
      } : null,
    }));

    // Format usage by month
    const formattedUsageByMonth = (usageByMonth || []).map((item: any) => ({
      month: item.month,
      count: Number(item.count),
    }));

    return NextResponse.json({
      totalApiCalls,
      topApps,
      topPartners,
      recentLogs: formattedRecentLogs,
      usageByMonth: formattedUsageByMonth,
    });
  } catch (error) {
    console.error('Error fetching usage data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

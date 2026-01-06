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
        _count: true,
        orderBy: {
          _count: {
            appId: 'desc',
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
          app: {
            select: {
              name: true,
              partner: {
                select: {
                  companyName: true,
                  user: {
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
      
      prisma.$queryRaw`
        SELECT 
          strftime('%Y-%m', timestamp) as month,
          COUNT(*) as count
        FROM ApiUsageLog
        WHERE timestamp >= datetime('now', '-12 months')
        GROUP BY month
        ORDER BY month DESC
      `,
    ]);

    const appDetails = await prisma.app.findMany({
      where: {
        id: { in: apiCallsByApp.map(a => a.appId) },
      },
      select: {
        id: true,
        name: true,
        currentUsage: true,
        monthlyLimit: true,
        partner: {
          select: {
            companyName: true,
            user: {
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
        id: { in: apiCallsByPartner.map(p => p.partnerId) },
      },
      select: {
        id: true,
        companyName: true,
        user: {
          select: {
            email: true,
          },
        },
        subscription: {
          select: {
            plan: {
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
        calls: item._count,
        currentUsage: app?.currentUsage || 0,
        monthlyLimit: app?.monthlyLimit || 0,
        partner: app?.partner,
      };
    });

    const topPartners = apiCallsByPartner.map(item => {
      const partner = partnerDetails.find(p => p.id === item.partnerId);
      return {
        partnerId: item.partnerId,
        companyName: partner?.companyName || 'Unknown',
        email: partner?.user.email || 'Unknown',
        usage: item._sum.currentUsage || 0,
        plan: partner?.subscription?.plan,
      };
    });

    return NextResponse.json({
      totalApiCalls,
      topApps,
      topPartners,
      recentLogs,
      usageByMonth,
    });
  } catch (error) {
    console.error('Error fetching usage data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

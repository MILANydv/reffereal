import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();

    if (session?.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const totalPartners = await prisma.partner.count();
    const totalApps = await prisma.app.count();
    
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'ACTIVE' },
    });

    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(1)),
        },
        status: 'paid',
      },
    });

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const totalApiCalls = await prisma.apiUsageLog.count({
      where: {
        timestamp: { gte: thirtyDaysAgo },
      },
    });

    // Get API calls by day for rate tracking
    const apiCallsByDay = await prisma.apiUsageLog.groupBy({
      by: ['timestamp'],
      where: {
        timestamp: { gte: thirtyDaysAgo },
      },
      _count: { id: true },
    });

    // Calculate daily averages
    const daysCount = 30;
    const avgDailyCalls = Math.round(totalApiCalls / daysCount);

    // Get top endpoints by usage
    const endpointUsage = await prisma.apiUsageLog.groupBy({
      by: ['endpoint'],
      where: {
        timestamp: { gte: thirtyDaysAgo },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const unresolvedFraudFlags = await prisma.fraudFlag.count({
      where: { isResolved: false },
    });

    const recentPartners = await prisma.partner.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true },
        },
        subscription: {
          include: {
            plan: {
              select: { type: true },
            },
          },
        },
      },
    });

    // Get total apps usage
    const totalAppsUsage = await prisma.app.aggregate({
      _sum: { currentUsage: true },
    });

    return NextResponse.json({
      totalPartners,
      totalApps,
      totalRevenue,
      totalApiCalls,
      avgDailyCalls,
      totalAppsUsage: totalAppsUsage._sum.currentUsage || 0,
      endpointUsage: endpointUsage.map(e => ({
        endpoint: e.endpoint,
        count: e._count.id,
      })),
      activeSubscriptions,
      unresolvedFraudFlags,
      recentPartners: recentPartners.map((p) => ({
        id: p.id,
        companyName: p.companyName,
        userEmail: p.user.email,
        planType: p.subscription?.plan.type || 'FREE',
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

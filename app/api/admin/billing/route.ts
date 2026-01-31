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
      allInvoices,
      subscriptions,
      revenueStats,
    ] = await Promise.all([
      prisma.invoice.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
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
      }),
      
      prisma.subscription.findMany({
        include: {
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
          PricingPlan: {
            select: {
              name: true,
              type: true,
              monthlyPrice: true,
            },
          },
        },
      }),
      
      prisma.invoice.aggregate({
        _sum: {
          amount: true,
          overageAmount: true,
        },
        _count: true,
      }),
    ]);

    const totalRevenue = revenueStats._sum.amount || 0;
    const totalOverage = revenueStats._sum.overageAmount || 0;
    const totalInvoices = revenueStats._count;

    const paidInvoices = allInvoices.filter(inv => inv.status === 'paid');
    const pendingInvoices = allInvoices.filter(inv => inv.status === 'pending');
    const failedInvoices = allInvoices.filter(inv => inv.status === 'failed');

    const paidRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const pendingRevenue = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    const subscriptionByPlan = subscriptions.reduce((acc, sub) => {
      const planType = sub.PricingPlan.type;
      acc[planType] = (acc[planType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const monthlyRecurringRevenue = subscriptions
      .filter(sub => sub.status === 'ACTIVE')
      .reduce((sum, sub) => sum + sub.PricingPlan.monthlyPrice, 0);

    return NextResponse.json({
      totalRevenue,
      totalOverage,
      totalInvoices,
      paidRevenue,
      pendingRevenue,
      paidInvoices: paidInvoices.length,
      pendingInvoices: pendingInvoices.length,
      failedInvoices: failedInvoices.length,
      monthlyRecurringRevenue,
      subscriptionByPlan,
      invoices: allInvoices,
      subscriptions,
    });
  } catch (error) {
    console.error('Error fetching billing data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

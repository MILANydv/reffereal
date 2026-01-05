import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateMonthlyUsage } from '@/lib/billing';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnerId = session.user.partnerId;

    const subscription = await prisma.subscription.findUnique({
      where: { partnerId },
      include: {
        plan: true,
      },
    });

    const invoices = await prisma.invoice.findMany({
      where: { partnerId },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });

    let currentUsage = {
      apiCalls: 0,
      overage: 0,
      estimatedCost: 0,
    };

    if (subscription) {
      const usage = await calculateMonthlyUsage(partnerId);
      currentUsage = {
        apiCalls: usage.totalApiCalls,
        overage: usage.overage,
        estimatedCost: usage.totalCost,
      };
    }

    return NextResponse.json({
      subscription: subscription
        ? {
            ...subscription,
            plan: {
              ...subscription.plan,
              features: JSON.parse(subscription.plan.features),
            },
          }
        : null,
      invoices,
      currentUsage,
    });
  } catch (error) {
    console.error('Billing data error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

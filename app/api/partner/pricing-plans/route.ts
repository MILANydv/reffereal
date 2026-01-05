import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plans = await prisma.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: { monthlyPrice: 'asc' },
    });

    return NextResponse.json(
      plans.map((plan) => ({
        ...plan,
        features: JSON.parse(plan.features),
      }))
    );
  } catch (error) {
    console.error('Pricing plans error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

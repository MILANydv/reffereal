import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - List all pricing plans (for partners: active only, for admin: all)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const isAdmin = session.user.role === 'SUPER_ADMIN';

    const where: Record<string, unknown> = {};
    
    // Partners can only see active plans, admins can see all
    if (!isAdmin && !includeInactive) {
      where.isActive = true;
    }

    const plans = await prisma.pricingPlan.findMany({
      where,
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

// POST - Create a new pricing plan (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, monthlyPrice, yearlyPrice, apiLimit, maxApps, overagePrice, features, isActive } = body;

    if (!name || !type || monthlyPrice === undefined || apiLimit === undefined || maxApps === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existing = await prisma.pricingPlan.findUnique({ where: { type } });
    if (existing) {
      return NextResponse.json({ error: 'Plan with this type already exists' }, { status: 400 });
    }

    const plan = await prisma.pricingPlan.create({
      data: {
        name,
        type,
        monthlyPrice: parseFloat(monthlyPrice),
        yearlyPrice: yearlyPrice ? parseFloat(yearlyPrice) : monthlyPrice * 12 * 0.8,
        apiLimit: parseInt(apiLimit),
        maxApps: parseInt(maxApps),
        overagePrice: parseFloat(overagePrice || 0.01),
        features: JSON.stringify(features || []),
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({
      ...plan,
      features: JSON.parse(plan.features),
    });
  } catch (error) {
    console.error('Create pricing plan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update a pricing plan (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    // Handle features array conversion
    if (updateData.features && Array.isArray(updateData.features)) {
      updateData.features = JSON.stringify(updateData.features);
    }

    // Convert numeric fields
    if (updateData.monthlyPrice !== undefined) updateData.monthlyPrice = parseFloat(updateData.monthlyPrice);
    if (updateData.yearlyPrice !== undefined) updateData.yearlyPrice = parseFloat(updateData.yearlyPrice);
    if (updateData.apiLimit !== undefined) updateData.apiLimit = parseInt(updateData.apiLimit);
    if (updateData.maxApps !== undefined) updateData.maxApps = parseInt(updateData.maxApps);
    if (updateData.overagePrice !== undefined) updateData.overagePrice = parseFloat(updateData.overagePrice);

    const plan = await prisma.pricingPlan.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      ...plan,
      features: JSON.parse(plan.features),
    });
  } catch (error) {
    console.error('Update pricing plan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a pricing plan (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    // Check if any subscriptions are using this plan
    const subscriptionCount = await prisma.subscription.count({ where: { planId: id } });
    if (subscriptionCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete plan with active subscriptions. Deactivate it instead.' },
        { status: 400 }
      );
    }

    await prisma.pricingPlan.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete pricing plan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

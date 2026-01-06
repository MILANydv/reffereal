import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const flags = await prisma.featureFlag.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(flags);
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { key, name, description, isEnabled, rolloutPercent, targetPartners } = body;

    if (!key || !name) {
      return NextResponse.json({ error: 'Key and name are required' }, { status: 400 });
    }

    const existing = await prisma.featureFlag.findUnique({ where: { key } });
    if (existing) {
      return NextResponse.json({ error: 'Feature flag with this key already exists' }, { status: 400 });
    }

    const flag = await prisma.featureFlag.create({
      data: {
        key,
        name,
        description,
        isEnabled: isEnabled || false,
        rolloutPercent: rolloutPercent || 0,
        targetPartners: targetPartners ? JSON.stringify(targetPartners) : null,
      },
    });

    return NextResponse.json(flag);
  } catch (error) {
    console.error('Error creating feature flag:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (updateData.targetPartners && Array.isArray(updateData.targetPartners)) {
      updateData.targetPartners = JSON.stringify(updateData.targetPartners);
    }

    const flag = await prisma.featureFlag.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(flag);
  } catch (error) {
    console.error('Error updating feature flag:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.featureFlag.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feature flag:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

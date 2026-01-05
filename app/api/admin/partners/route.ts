import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const partners = await prisma.partner.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            active: true,
          },
        },
        _count: {
          select: {
            apps: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { partnerId, active } = body;

    if (!partnerId) {
      return NextResponse.json(
        { error: 'partnerId is required' },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: { user: true },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: partner.userId },
      data: { active: active !== undefined ? active : partner.user.active },
    });

    const updatedPartner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            active: true,
          },
        },
        _count: {
          select: {
            apps: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPartner);
  } catch (error) {
    console.error('Error updating partner:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('id');

    if (partnerId) {
      const partner = await prisma.partner.findUnique({
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
          subscription: {
            include: {
              plan: true,
            },
          },
          apps: {
            select: {
              id: true,
              name: true,
              status: true,
              currentUsage: true,
              monthlyLimit: true,
            },
          },
          invoices: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: {
            select: {
              apps: true,
              teamMembers: true,
            },
          },
        },
      });

      if (!partner) {
        return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
      }

      return NextResponse.json(partner);
    }

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
        subscription: {
          include: {
            plan: {
              select: {
                type: true,
              },
            },
          },
        },
        apps: {
          select: {
            currentUsage: true,
          },
        },
        invoices: {
          select: {
            status: true,
            amount: true,
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
    await logger.error('Failed to fetch partners', 'admin-api', { error: String(error) });
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
    const { partnerId, companyName, active } = body;

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

    const updateData: { companyName?: string; active?: boolean } = {};
    if (companyName !== undefined) updateData.companyName = companyName;
    if (active !== undefined) updateData.active = active;

    await prisma.partner.update({
      where: { id: partnerId },
      data: updateData,
    });

    if (active !== undefined) {
      await prisma.user.update({
        where: { id: partner.userId },
        data: { active },
      });
    }

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
        subscription: {
          include: {
            plan: {
              select: {
                type: true,
              },
            },
          },
        },
        apps: {
          select: {
            currentUsage: true,
          },
        },
        invoices: {
          select: {
            status: true,
            amount: true,
          },
        },
        _count: {
          select: {
            apps: true,
          },
        },
      },
    });

    await logger.info(
      `Partner ${partnerId} updated by admin`,
      'admin-api',
      { partnerId, changes: updateData, adminId: session.user.id }
    );

    return NextResponse.json(updatedPartner);
  } catch (error) {
    console.error('Error updating partner:', error);
    await logger.error('Failed to update partner', 'admin-api', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('id');

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

    await prisma.user.delete({
      where: { id: partner.userId },
    });

    await logger.warn(
      `Partner ${partnerId} deleted by admin`,
      'admin-api',
      { partnerId, email: partner.user.email, adminId: session.user.id }
    );

    return NextResponse.json({ success: true, message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Error deleting partner:', error);
    await logger.error('Failed to delete partner', 'admin-api', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

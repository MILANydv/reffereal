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
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { partner: { companyName: { contains: search } } },
        { partner: { user: { email: { contains: search } } } },
      ];
    }

    const apps = await prisma.app.findMany({
      where,
      include: {
        partner: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            campaigns: true,
            apiUsageLogs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(apps);
  } catch (error) {
    console.error('Error fetching apps:', error);
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
    const { appId, status, monthlyLimit, name } = body;

    if (!appId) {
      return NextResponse.json(
        { error: 'appId is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (monthlyLimit !== undefined) updateData.monthlyLimit = monthlyLimit;
    if (name) updateData.name = name;

    const app = await prisma.app.update({
      where: { id: appId },
      data: updateData,
      include: {
        partner: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            campaigns: true,
            apiUsageLogs: true,
          },
        },
      },
    });

    await logger.info(
      `App ${appId} updated by admin`,
      'admin-api',
      { appId, changes: updateData, adminId: session.user.id }
    );

    return NextResponse.json(app);
  } catch (error) {
    console.error('Error updating app:', error);
    await logger.error('Failed to update app', 'admin-api', { error: String(error) });
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
    const appId = searchParams.get('id');

    if (!appId) {
      return NextResponse.json(
        { error: 'appId is required' },
        { status: 400 }
      );
    }

    const app = await prisma.app.findUnique({
      where: { id: appId },
      include: { partner: true },
    });

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    await prisma.app.delete({
      where: { id: appId },
    });

    await logger.warn(
      `App ${appId} deleted by admin`,
      'admin-api',
      { appId, appName: app.name, partnerId: app.partnerId, adminId: session.user.id }
    );

    return NextResponse.json({ success: true, message: 'App deleted successfully' });
  } catch (error) {
    console.error('Error deleting app:', error);
    await logger.error('Failed to delete app', 'admin-api', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

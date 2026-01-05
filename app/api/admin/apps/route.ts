import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const apps = await prisma.app.findMany({
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
    const { appId, status, monthlyLimit } = body;

    if (!appId) {
      return NextResponse.json(
        { error: 'appId is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (monthlyLimit !== undefined) updateData.monthlyLimit = monthlyLimit;

    const app = await prisma.app.update({
      where: { id: appId },
      data: updateData,
    });

    return NextResponse.json(app);
  } catch (error) {
    console.error('Error updating app:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

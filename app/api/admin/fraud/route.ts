import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const showManualOnly = searchParams.get('manual') === 'true';

    const whereClause: any = {};
    
    if (filter === 'unresolved') {
      whereClause.isResolved = false;
    } else if (filter === 'resolved') {
      whereClause.isResolved = true;
    }

    if (showManualOnly) {
      whereClause.isManual = true;
    }

    const flags = await prisma.fraudFlag.findMany({
      where: whereClause,
      include: {
        App: {
          include: {
            Partner: {
              include: {
                User: {
                  select: {
                    email: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { isManual: 'desc' }, // Manual flags first
        { createdAt: 'desc' },
      ],
    });

    // Get stats
    const totalFlags = await prisma.fraudFlag.count();
    const unresolvedFlags = await prisma.fraudFlag.count({ where: { isResolved: false } });
    const manualFlags = await prisma.fraudFlag.count({ where: { isManual: true, isResolved: false } });

    return NextResponse.json({
      flags,
      stats: {
        total: totalFlags,
        unresolved: unresolvedFlags,
        manual: manualFlags,
      },
    });
  } catch (error) {
    console.error('Fraud flags error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

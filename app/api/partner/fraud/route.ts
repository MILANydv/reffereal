import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'unresolved';
    const partnerId = session.user.partnerId;

    const whereClause: {
      App: { partnerId: string };
      isResolved?: boolean;
    } = {
      App: { partnerId },
    };

    if (filter === 'unresolved') {
      whereClause.isResolved = false;
    } else if (filter === 'resolved') {
      whereClause.isResolved = true;
    }

    const flags = await prisma.fraudFlag.findMany({
      where: whereClause,
      include: {
        App: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      flags.map((flag) => ({
        ...flag,
        appName: flag.App.name,
      }))
    );
  } catch (error) {
    console.error('Fraud flags error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

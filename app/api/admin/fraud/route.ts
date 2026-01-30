import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const flags = await prisma.fraudFlag.findMany({
      include: {
        app: {
          include: {
            partner: {
              include: {
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(flags);
  } catch (error) {
    console.error('Error fetching fraud flags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}





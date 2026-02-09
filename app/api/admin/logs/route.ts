import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const search = searchParams.get('search');
    const source = searchParams.get('source');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const conditions: Record<string, unknown>[] = [];
    if (level && level !== 'all') {
      conditions.push({ level: level.toUpperCase() });
    }
    if (source && source !== '') {
      if (source === 'system') {
        conditions.push({
          OR: [
            { source: null },
            { source: { not: { startsWith: 'api' } } },
          ],
        });
      } else {
        conditions.push({ source: { startsWith: source } });
      }
    }
    if (search) {
      conditions.push({
        OR: [
          { message: { contains: search } },
          { source: { contains: search } },
        ],
      });
    }
    const where = conditions.length > 0 ? { AND: conditions } : {};

    const [logs, total] = await Promise.all([
      prisma.systemLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.systemLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching system logs:', error);
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
    const before = searchParams.get('before');

    if (!before) {
      return NextResponse.json({ error: 'Time parameter required' }, { status: 400 });
    }

    const beforeDate = new Date(before);
    const result = await prisma.systemLog.deleteMany({
      where: {
        createdAt: { lt: beforeDate },
      },
    });

    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    console.error('Error deleting system logs:', error);
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
    const { level, message, source, metadata } = body;

    if (!level || !message) {
      return NextResponse.json({ error: 'Level and message are required' }, { status: 400 });
    }

    const log = await prisma.systemLog.create({
      data: {
        level: level.toUpperCase(),
        message,
        source: source || 'admin',
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error('Error creating system log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

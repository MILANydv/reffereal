import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateApiKey } from '@/lib/api-key';

export async function GET() {
  const session = await auth();

  if (!session || !session.user.partnerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const apps = await prisma.app.findMany({
      where: { partnerId: session.user.partnerId },
      include: {
        campaigns: true,
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

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user.partnerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, monthlyLimit } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'App name is required' },
        { status: 400 }
      );
    }

    const apiKey = generateApiKey();

    const app = await prisma.app.create({
      data: {
        name,
        apiKey,
        partnerId: session.user.partnerId,
        monthlyLimit: monthlyLimit || 10000,
      },
    });

    return NextResponse.json(app, { status: 201 });
  } catch (error) {
    console.error('Error creating app:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

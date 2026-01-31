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
    // Ensure connection is active
    await prisma.$connect();
    
    const apps = await prisma.app.findMany({
      where: { partnerId: session.user.partnerId },
      include: {
        Campaign: true,
        _count: {
          select: {
            Campaign: true,
            ApiUsageLog: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(apps);
  } catch (error) {
    console.error('Error fetching apps:', error);
    // Try to reconnect on error
    try {
      await prisma.$disconnect();
      await prisma.$connect();
    } catch (reconnectError) {
      console.error('Failed to reconnect:', reconnectError);
    }
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
        Partner: { connect: { id: session.user.partnerId } },
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

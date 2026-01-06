import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnerId = session.user.partnerId;
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');

    const whereClause: { 
      webhook: { app: { partnerId: string; id?: string } }
    } = {
      webhook: { app: { partnerId } },
    };

    if (appId) {
      whereClause.webhook.app.id = appId;
    }

    const deliveries = await prisma.webhookDelivery.findMany({
      where: whereClause,
      include: {
        webhook: {
          select: {
            url: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    const recentDeliveries = deliveries.map(delivery => ({
      id: delivery.id,
      eventType: delivery.eventType,
      url: delivery.webhook.url,
      statusCode: delivery.statusCode || 0,
      success: delivery.success,
      timestamp: delivery.createdAt.toISOString(),
    }));

    return NextResponse.json({ deliveries: recentDeliveries });
  } catch (error) {
    console.error('Webhook deliveries error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

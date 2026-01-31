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
      Webhook: { App: { partnerId: string; id?: string } }
    } = {
      Webhook: { App: { partnerId } },
    };

    if (appId) {
      whereClause.Webhook.App.id = appId;
    }

    const deliveries = await prisma.webhookDelivery.findMany({
      where: whereClause,
      include: {
        Webhook: {
          include: {
            App: {
              select: {
                id: true,
                name: true,
              },
            },
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
      url: delivery.Webhook.url,
      statusCode: delivery.statusCode || 0,
      success: delivery.success,
      timestamp: delivery.createdAt.toISOString(),
      app: {
        id: delivery.Webhook.App.id,
        name: delivery.Webhook.App.name,
      },
    }));

    return NextResponse.json({ deliveries: recentDeliveries });
  } catch (error) {
    console.error('Webhook deliveries error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

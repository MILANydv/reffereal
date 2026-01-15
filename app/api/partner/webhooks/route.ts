import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnerId = session.user.partnerId;

    const webhooks = await prisma.webhook.findMany({
      where: {
        app: { partnerId },
      },
      include: {
        app: {
          select: { name: true },
        },
        _count: {
          select: {
            deliveries: true,
          },
        },
      },
    });

    const webhooksWithStats = await Promise.all(
      webhooks.map(async (webhook) => {
        const successCount = await prisma.webhookDelivery.count({
          where: { webhookId: webhook.id, success: true },
        });
        const failedCount = await prisma.webhookDelivery.count({
          where: { webhookId: webhook.id, success: false },
        });

        return {
          id: webhook.id,
          url: webhook.url,
          events: JSON.parse(webhook.events),
          isActive: webhook.isActive,
          appId: webhook.appId,
          appName: webhook.app.name,
          createdAt: webhook.createdAt,
          deliveryStats: {
            total: webhook._count.deliveries,
            successful: successCount,
            failed: failedCount,
          },
        };
      })
    );

    return NextResponse.json(webhooksWithStats);
  } catch (error) {
    console.error('Webhooks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appId, url, events } = await request.json();
    const partnerId = session.user.partnerId;

    const app = await prisma.app.findFirst({
      where: { id: appId, partnerId },
    });

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    // Generate a random 32-byte secret using Web Crypto
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const secret = Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const webhook = await prisma.webhook.create({
      data: {
        appId,
        url,
        secret,
        events: JSON.stringify(events),
      },
    });

    return NextResponse.json({
      ...webhook,
      events: JSON.parse(webhook.events),
    });
  } catch (error) {
    console.error('Webhook creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

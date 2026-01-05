import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ webhookId: string }> }
) {
  try {
    const session = await auth();
    const { webhookId } = await params;

    if (!session?.user?.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isActive } = await request.json();
    const partnerId = session.user.partnerId;

    const webhook = await prisma.webhook.findFirst({
      where: {
        id: webhookId,
        app: { partnerId },
      },
    });

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    const updated = await prisma.webhook.update({
      where: { id: webhookId },
      data: { isActive },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Webhook update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ webhookId: string }> }
) {
  try {
    const session = await auth();
    const { webhookId } = await params;

    if (!session?.user?.partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnerId = session.user.partnerId;

    const webhook = await prisma.webhook.findFirst({
      where: {
        id: webhookId,
        app: { partnerId },
      },
    });

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    await prisma.webhook.delete({
      where: { id: webhookId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

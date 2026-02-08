import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * PATCH /api/partner/apps/[id]
 * Update app name, description, and/or allowedDomains. Partner must own the app.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.partnerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const app = await prisma.app.findFirst({
    where: {
      id,
      partnerId: session.user.partnerId,
    },
  });

  if (!app) {
    return NextResponse.json({ error: 'App not found' }, { status: 404 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const data: { name?: string; description?: string | null; allowedDomains?: string | null } = {};

    if (typeof body.name === 'string') {
      const trimmed = body.name.trim();
      if (trimmed.length === 0) {
        return NextResponse.json({ error: 'App name cannot be empty' }, { status: 400 });
      }
      data.name = trimmed;
    }
    if (typeof body.description === 'string' || body.description === null) {
      data.description = typeof body.description === 'string' ? body.description.trim() || null : null;
    }
    if (typeof body.allowedDomains === 'string' || body.allowedDomains === null) {
      data.allowedDomains = typeof body.allowedDomains === 'string' ? body.allowedDomains.trim() || null : null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(app);
    }

    const updated = await prisma.app.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating app:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/partner/apps/[id]
 * Permanently delete an app. Partner must own the app. Cascades to campaigns, webhooks, etc.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.partnerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const app = await prisma.app.findFirst({
    where: {
      id,
      partnerId: session.user.partnerId,
    },
  });

  if (!app) {
    return NextResponse.json({ error: 'App not found' }, { status: 404 });
  }

  try {
    await prisma.app.delete({
      where: { id },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting app:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

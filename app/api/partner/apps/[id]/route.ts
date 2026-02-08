import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
    const data: { name?: string; description?: string; allowedDomains?: string } = {};
    if (typeof body.name === 'string') data.name = body.name;
    if (typeof body.description === 'string' || body.description === null) data.description = body.description ?? null;
    if (typeof body.allowedDomains === 'string' || body.allowedDomains === null) data.allowedDomains = body.allowedDomains ?? null;

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

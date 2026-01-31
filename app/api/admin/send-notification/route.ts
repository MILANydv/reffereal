import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { notifyCustomAdmin } from '@/lib/notifications';
import { prisma } from '@/lib/db';
import { NotificationType } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, partnerId, title, message, metadata } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    let targetUserId = userId;

    // If partnerId is provided, get the user ID
    if (!targetUserId && partnerId) {
      const partner = await prisma.partner.findUnique({
        where: { id: partnerId },
        include: { User: true },
      });
      targetUserId = partner?.User.id;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'User ID or Partner ID is required' },
        { status: 400 }
      );
    }

    await notifyCustomAdmin(targetUserId, title, message, metadata);

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
    });
  } catch (error) {
    console.error('Error sending custom notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

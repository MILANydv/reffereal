import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, archiveNotification, getUnreadCount } from '@/lib/notifications';
import { NotificationStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as NotificationStatus | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await getNotifications(session.user.id, {
      status: status || undefined,
      limit,
      offset,
    });

    const unreadCount = await getUnreadCount(session.user.id);

    return NextResponse.json({
      ...result,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, action } = body;

    if (action === 'read' && notificationId) {
      await markNotificationAsRead(notificationId, session.user.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'read-all') {
      await markAllNotificationsAsRead(session.user.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'archive' && notificationId) {
      await archiveNotification(notificationId, session.user.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

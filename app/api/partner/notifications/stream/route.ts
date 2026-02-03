import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getUnreadCount, getNotifications } from '@/lib/notifications';
import { notificationEvents, NOTIFICATION_CREATED, NOTIFICATION_READ, NOTIFICATION_ARCHIVED } from '@/lib/notification-events';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let isStreamOpen = true;

      // Send event helper
      const sendEvent = (data: any) => {
        if (!isStreamOpen) return;

        try {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error('[SSE] Error sending event:', error);
          // If we fail to send, the stream is likely closed
          isStreamOpen = false;
        }
      };

      // Send initial state
      try {
        const unreadCount = await getUnreadCount(userId);
        sendEvent({ type: 'unread_count', count: unreadCount });
      } catch (error) {
        console.error('Error sending initial notification count:', error);
      }

      // Listen for notification events
      const handleNotificationCreated = async (data: { userId: string; notificationId: string }) => {
        if (!isStreamOpen) return;
        if (data.userId === userId) {
          // Fetch updated unread count
          try {
            const unreadCount = await getUnreadCount(userId);
            sendEvent({ type: 'unread_count', count: unreadCount });

            // Optionally send the new notification
            const { notifications } = await getNotifications(userId, { limit: 1, status: 'UNREAD' });
            if (notifications.length > 0 && notifications[0].id === data.notificationId) {
              sendEvent({
                type: 'new_notification',
                notification: notifications[0]
              });
            }
          } catch (error) {
            console.error('Error in handleNotificationCreated:', error);
          }
        }
      };

      const handleNotificationRead = async (data: { userId: string; notificationId: string }) => {
        if (!isStreamOpen) return;
        if (data.userId === userId) {
          try {
            const unreadCount = await getUnreadCount(userId);
            sendEvent({ type: 'unread_count', count: unreadCount });
          } catch (error) {
            console.error('Error in handleNotificationRead:', error);
          }
        }
      };

      // Register event listeners
      notificationEvents.on(NOTIFICATION_CREATED, handleNotificationCreated);
      notificationEvents.on(NOTIFICATION_READ, handleNotificationRead);

      // Keep connection alive with heartbeat
      const heartbeatInterval = setInterval(() => {
        if (!isStreamOpen) {
          clearInterval(heartbeatInterval);
          return;
        }
        sendEvent({ type: 'heartbeat', timestamp: Date.now() });
      }, 30000); // Every 30 seconds

      // Cleanup on close
      const cleanup = () => {
        if (!isStreamOpen) return;
        isStreamOpen = false;

        notificationEvents.removeListener(NOTIFICATION_CREATED, handleNotificationCreated);
        notificationEvents.removeListener(NOTIFICATION_READ, handleNotificationRead);
        clearInterval(heartbeatInterval);

        try {
          controller.close();
        } catch (error) {
          // Connection already closed
        }
      };

      request.signal.addEventListener('abort', cleanup);

      // Also handle connection close
      if (request.signal.aborted) {
        cleanup();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering in nginx
    },
  });
}

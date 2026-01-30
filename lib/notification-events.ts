import { EventEmitter } from 'events';

// Global event emitter for notifications
class NotificationEventEmitter extends EventEmitter {}
export const notificationEvents = new NotificationEventEmitter();

// Event types
export const NOTIFICATION_CREATED = 'notification:created';
export const NOTIFICATION_READ = 'notification:read';
export const NOTIFICATION_ARCHIVED = 'notification:archived';

// Helper to emit notification events
export function emitNotificationCreated(userId: string, notificationId: string) {
  notificationEvents.emit(NOTIFICATION_CREATED, { userId, notificationId });
}

export function emitNotificationRead(userId: string, notificationId: string) {
  notificationEvents.emit(NOTIFICATION_READ, { userId, notificationId });
}

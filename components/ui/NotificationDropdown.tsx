'use client';

import { Bell, Check, CheckCheck, Archive, X } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  createdAt: string;
  readAt: string | null;
  metadata: any;
}

interface NotificationResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async (showAll = false) => {
    setLoading(true);
    try {
      // Always fetch unread count separately
      const unreadResponse = await fetch('/api/partner/notifications?limit=1&status=UNREAD');
      if (unreadResponse.ok) {
        const unreadData: NotificationResponse = await unreadResponse.json();
        setUnreadCount(unreadData.unreadCount);
      }

      // Fetch notifications based on showAll flag
      const url = showAll 
        ? '/api/partner/notifications?limit=20'
        : '/api/partner/notifications?limit=20&status=UNREAD';
      const response = await fetch(url);
      if (response.ok) {
        const data: NotificationResponse = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // SSE connection for real-time notifications
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/partner/notifications/stream');

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'unread_count') {
              setUnreadCount(data.count);
              // If dropdown is open, refresh notifications
              if (isOpen) {
                fetchNotifications(true);
              }
            } else if (data.type === 'new_notification') {
              // Add new notification to the list if dropdown is open
              if (isOpen) {
                setNotifications(prev => [data.notification, ...prev]);
              }
              setUnreadCount(prev => prev + 1);
            } else if (data.type === 'heartbeat') {
              // Connection is alive
            }
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE connection error:', error);
          // Reconnect after 3 seconds
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          reconnectTimeout = setTimeout(connectSSE, 3000);
        };
      } catch (error) {
        console.error('Error setting up SSE:', error);
      }
    };

    connectSSE();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(true); // Show all notifications when dropdown is open
    }
  }, [isOpen, fetchNotifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/partner/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, action: 'read' }),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId
              ? { ...n, status: 'READ' as const, readAt: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/partner/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read-all' }),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, status: 'READ' as const, readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'REFERRAL_CONVERTED':
        return '💰';
      case 'REFERRAL_CODE_GENERATED':
        return '🎯';
      case 'TEAM_INVITE_ACCEPTED':
        return '👥';
      case 'CUSTOM_ADMIN':
        return '📢';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'REFERRAL_CONVERTED':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'REFERRAL_CODE_GENERATED':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'TEAM_INVITE_ACCEPTED':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
      case 'CUSTOM_ADMIN':
        return 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors relative"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900">
            {unreadCount > 9 && (
              <span className="absolute -top-1 -right-1 text-[8px] font-bold text-white bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
                9+
              </span>
            )}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50 overflow-hidden flex flex-col max-h-[600px]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                >
                  <CheckCheck size={14} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-slate-400">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-slate-400">
                  No new notifications
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${
                        notification.status === 'UNREAD' ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg ${getNotificationColor(
                            notification.type
                          )}`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                            {notification.status === 'UNREAD' && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="ml-2 p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                aria-label="Mark as read"
                              >
                                <Check size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-200 dark:border-slate-700 text-center">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/dashboard/v2/notifications';
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

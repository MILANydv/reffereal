'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, CheckCheck, Loader2, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

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

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const offset = (page - 1) * limit;
            const response = await fetch(`/api/partner/notifications?limit=${limit}&offset=${offset}`);
            if (response.ok) {
                const data: NotificationResponse = await response.json();
                setNotifications(data.notifications);
                setTotal(data.total);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [page]);

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

    const totalPages = Math.ceil(total / limit);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                        <p className="text-gray-500 mt-1">Stay updated with your latest activities and alerts.</p>
                    </div>
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    >
                        <CheckCheck size={16} className="mr-2 text-blue-500" />
                        Mark all as read
                    </button>
                </div>

                <Card>
                    <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <CardTitle>All Notifications</CardTitle>
                            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                Total: {total}
                            </span>
                        </div>
                    </CardHeader>
                    <CardBody className="p-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                                <p className="text-gray-500 text-sm">Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <Inbox className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No notifications</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                                    You're all caught up! New notifications will appear here when they arrive.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex gap-4 ${notification.status === 'UNREAD' ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                                            }`}
                                    >
                                        <div
                                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${getNotificationColor(
                                                notification.type
                                            )}`}
                                        >
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h4 className={`text-sm font-semibold ${notification.status === 'UNREAD' ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                                {notification.status === 'UNREAD' && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardBody>
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Page {page} of {totalPages}
                            </span>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1 || loading}
                                    className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages || loading}
                                    className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
}

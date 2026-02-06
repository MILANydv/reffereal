import { prisma } from './db';
import { NotificationType, NotificationStatus } from '@prisma/client';
import { emitNotificationCreated, emitNotificationRead } from './notification-events';

interface CreateNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  metadata,
}: CreateNotificationOptions) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null,
        status: NotificationStatus.UNREAD,
      },
    });

    // Emit event for real-time updates
    emitNotificationCreated(userId, notification.id);

    return notification;
  } catch (error) {
    console.error('[Notification] Error creating notification:', error);
    throw error;
  }
}

export async function getNotifications(userId: string, options?: {
  status?: NotificationStatus;
  limit?: number;
  offset?: number;
}) {
  const where: any = { userId };
  if (options?.status) {
    where.status = options.status;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications: notifications.map(n => ({
      ...n,
      metadata: n.metadata ? JSON.parse(n.metadata) : null,
    })),
    total,
  };
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  const result = await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId, // Ensure user owns the notification
    },
    data: {
      status: NotificationStatus.READ,
      readAt: new Date(),
    },
  });

  // Emit event for real-time updates
  if (result.count > 0) {
    emitNotificationRead(userId, notificationId);
  }

  return result;
}

export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      status: NotificationStatus.UNREAD,
    },
    data: {
      status: NotificationStatus.READ,
      readAt: new Date(),
    },
  });
}

export async function archiveNotification(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      status: NotificationStatus.ARCHIVED,
    },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: {
      userId,
      status: NotificationStatus.UNREAD,
    },
  });
}

// Notification triggers

export async function notifyReferralConversion(
  userId: string,
  referral: { code: string; rewardAmount?: number; campaignName: string }
) {
  return createNotification({
    userId,
    type: NotificationType.REFERRAL_CONVERTED,
    title: 'New Referral Conversion!',
    message: `Your referral code "${referral.code}" in campaign "${referral.campaignName}" has been converted${referral.rewardAmount ? ` with a reward of $${referral.rewardAmount.toFixed(2)}` : ''}.`,
    metadata: {
      referralCode: referral.code,
      campaignName: referral.campaignName,
      rewardAmount: referral.rewardAmount,
    },
  });
}

export async function notifyReferralCodeGenerated(
  userId: string,
  referral: { code: string; campaignName: string }
) {
  return createNotification({
    userId,
    type: NotificationType.REFERRAL_CODE_GENERATED,
    title: 'New Referral Code Generated',
    message: `A new referral code "${referral.code}" has been generated for campaign "${referral.campaignName}".`,
    metadata: {
      referralCode: referral.code,
      campaignName: referral.campaignName,
    },
  });
}

export async function notifyTeamInviteAccepted(
  userId: string,
  teamMember: { name?: string; email: string; role: string }
) {
  return createNotification({
    userId,
    type: NotificationType.TEAM_INVITE_ACCEPTED,
    title: 'Team Member Joined',
    message: `${teamMember.name || teamMember.email} has accepted your team invitation and joined as ${teamMember.role}.`,
    metadata: {
      teamMemberEmail: teamMember.email,
      teamMemberName: teamMember.name,
      role: teamMember.role,
    },
  });
}

export async function notifyCustomAdmin(
  userId: string,
  title: string,
  message: string,
  metadata?: Record<string, any>
) {
  return createNotification({
    userId,
    type: NotificationType.CUSTOM_ADMIN,
    title,
    message,
    metadata,
  });
}

export async function notifyPartnerFraud(
  userId: string,
  alert: {
    referralCode: string;
    appName: string;
    fraudType: string;
  }
) {
  return createNotification({
    userId,
    type: NotificationType.FRAUD_ALERT,
    title: 'Fraud Alert Detected',
    message: `Suspicious activity detected for referral code "${alert.referralCode}" in "${alert.appName}". Type: ${alert.fraudType}.`,
    metadata: {
      referralCode: alert.referralCode,
      fraudType: alert.fraudType,
      appName: alert.appName,
    },
  });
}

export async function notifyAdminFraud(
  title: string,
  message: string,
  metadata?: Record<string, any>
) {
  // Notify all SUPER_ADMINS
  const admins = await prisma.user.findMany({
    where: { role: 'SUPER_ADMIN', active: true },
  });

  return Promise.all(
    admins.map(admin =>
      createNotification({
        userId: admin.id,
        type: NotificationType.FRAUD_ALERT,
        title: `[ADMIN] ${title}`,
        message,
        metadata,
      })
    )
  );
}

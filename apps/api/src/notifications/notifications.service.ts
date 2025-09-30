import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../database/prisma.service';
import { NotificationChannel, UserRole } from '@prisma/client';

export interface NotificationData {
  userId: string;
  channel: NotificationChannel;
  subject: string;
  body: string;
  meta?: any;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue('notifications') private notificationQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async sendNotification(data: NotificationData) {
    // Add to queue for processing
    await this.notificationQueue.add('send', data);
  }

  async sendBulkNotifications(notifications: NotificationData[]) {
    // Add multiple notifications to queue
    await this.notificationQueue.addBulk(
      notifications.map(notification => ({
        name: 'send',
        data: notification,
      }))
    );
  }

  async notifyPricingTeam(tradeLaneId: string, subject: string, body: string) {
    // Get all pricing team members assigned to this trade lane
    const assignments = await this.prisma.pricingTeamAssignment.findMany({
      where: { tradeLaneId },
      include: { user: true },
    });

    const notifications = assignments.map(assignment => ({
      userId: assignment.user.id,
      channel: 'SYSTEM' as NotificationChannel,
      subject,
      body,
      meta: { tradeLaneId },
    }));

    await this.sendBulkNotifications(notifications);
  }

  async notifyRole(role: UserRole, subject: string, body: string, excludeUserId?: string) {
    const users = await this.prisma.user.findMany({
      where: {
        role,
        status: 'ACTIVE',
        ...(excludeUserId && { id: { not: excludeUserId } }),
      },
    });

    const notifications = users.map(user => ({
      userId: user.id,
      channel: 'SYSTEM' as NotificationChannel,
      subject,
      body,
    }));

    await this.sendBulkNotifications(notifications);
  }

  async getUserNotifications(userId: string, limit = 50, offset = 0) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        status: 'PENDING',
      },
      data: { status: 'SENT' },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        status: 'PENDING',
      },
      data: { status: 'SENT' },
    });
  }
}

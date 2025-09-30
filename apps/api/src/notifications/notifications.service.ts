import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  async create(createDto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: createDto,
    });

    // Add to queue for processing
    await this.notificationQueue.add('process-notification', {
      notificationId: notification.id,
    });

    return notification;
  }

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { 
        id: notificationId,
        userId,
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
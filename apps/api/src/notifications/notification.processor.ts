import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './providers/email.service';
import { SmsService } from './providers/sms.service';

@Processor('notifications')
export class NotificationProcessor {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  @Process('process-notification')
  async handleNotification(job: Job<{ notificationId: string }>) {
    const { notificationId } = job.data;

    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      include: { user: true },
    });

    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    try {
      switch (notification.channel) {
        case 'EMAIL':
          await this.emailService.send({
            to: notification.user.email,
            subject: notification.subject,
            text: notification.body,
          });
          break;
        case 'SMS':
          if (notification.user.phone) {
            await this.smsService.send({
              to: notification.user.phone,
              message: notification.body,
            });
          }
          break;
        case 'SYSTEM':
          // System notifications are already stored in DB
          break;
      }

      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'SENT' },
      });
    } catch (error) {
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  }
}
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../../database/prisma.service';
import { EmailProvider } from '../providers/email.provider';
import { SmsProvider } from '../providers/sms.provider';
import { NotificationData } from '../notifications.service';

@Processor('notifications')
export class NotificationProcessor {
  constructor(
    private prisma: PrismaService,
    private emailProvider: EmailProvider,
    private smsProvider: SmsProvider,
  ) {}

  @Process('send')
  async handleNotification(job: Job<NotificationData>) {
    const { userId, channel, subject, body, meta } = job.data;

    try {
      // Create notification record
      const notification = await this.prisma.notification.create({
        data: {
          userId,
          channel,
          subject,
          body,
          meta: meta || {},
          status: 'PENDING',
        },
      });

      // Send based on channel
      let success = false;
      
      if (channel === 'EMAIL') {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });
        
        if (user?.email) {
          success = await this.emailProvider.sendEmail(user.email, subject, body);
        }
      } else if (channel === 'SMS') {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });
        
        if (user?.phone) {
          success = await this.smsProvider.sendSms(user.phone, body);
        }
      } else if (channel === 'SYSTEM') {
        // System notifications are always successful
        success = true;
      }

      // Update notification status
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: success ? 'SENT' : 'FAILED' },
      });

    } catch (error) {
      console.error('Notification processing failed:', error);
      
      // Update notification as failed
      await this.prisma.notification.updateMany({
        where: { userId, subject, body },
        data: { status: 'FAILED' },
      });
    }
  }
}

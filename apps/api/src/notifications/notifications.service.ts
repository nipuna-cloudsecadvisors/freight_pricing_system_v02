import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailProvider } from './providers/email.provider';
import { SmsProvider } from './providers/sms.provider';
import { NotificationChannel } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private emailProvider: EmailProvider,
    private smsProvider: SmsProvider,
  ) {}

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to recent 50 notifications
    });
  }

  async createNotification(
    userId: string,
    channel: NotificationChannel,
    subject: string,
    body: string,
    meta?: any
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        channel,
        subject,
        body,
        meta,
      },
    });
  }

  async sendNotification(
    userId: string,
    channels: NotificationChannel[],
    subject: string,
    body: string,
    meta?: any
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const notifications = [];

    for (const channel of channels) {
      const notification = await this.createNotification(
        userId,
        channel,
        subject,
        body,
        meta
      );

      try {
        if (channel === NotificationChannel.EMAIL && user.email) {
          await this.emailProvider.sendEmail(
            user.email,
            subject,
            body,
            user.name
          );
          await this.markNotificationSent(notification.id);
        } else if (channel === NotificationChannel.SMS && user.phone) {
          await this.smsProvider.sendSms(
            user.phone,
            `${subject}: ${body}`
          );
          await this.markNotificationSent(notification.id);
        }
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error);
        await this.markNotificationFailed(notification.id);
      }

      notifications.push(notification);
    }

    return notifications;
  }

  async markNotificationSent(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });
  }

  async markNotificationFailed(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: 'FAILED',
      },
    });
  }

  // Specific notification methods
  async notifyRateRequestCreated(rateRequestId: string) {
    const rateRequest = await this.prisma.rateRequest.findUnique({
      where: { id: rateRequestId },
      include: {
        salesperson: true,
        customer: { select: { name: true } },
        pol: { select: { name: true } },
        pod: { select: { name: true } }
      }
    });

    if (!rateRequest) return;

    // Notify pricing team
    const pricingUsers = await this.prisma.user.findMany({
      where: { role: 'PRICING' },
      select: { id: true }
    });

    const subject = `New Rate Request: ${rateRequest.refNo}`;
    const body = `New rate request from ${rateRequest.salesperson.name} for ${rateRequest.customer.name}. Route: ${rateRequest.pol.name} to ${rateRequest.pod.name}`;

    for (const user of pricingUsers) {
      await this.sendNotification(
        user.id,
        [NotificationChannel.SYSTEM, NotificationChannel.EMAIL],
        subject,
        body,
        { rateRequestId, type: 'rate_request_created' }
      );
    }
  }

  async notifyRateRequestResponse(rateRequestId: string) {
    const rateRequest = await this.prisma.rateRequest.findUnique({
      where: { id: rateRequestId },
      include: {
        salesperson: true,
        customer: { select: { name: true } }
      }
    });

    if (!rateRequest) return;

    const subject = `Rate Request Response: ${rateRequest.refNo}`;
    const body = `Your rate request for ${rateRequest.customer.name} has received a response.`;

    await this.sendNotification(
      rateRequest.salespersonId,
      [NotificationChannel.SYSTEM, NotificationChannel.EMAIL, NotificationChannel.SMS],
      subject,
      body,
      { rateRequestId, type: 'rate_request_response' }
    );
  }

  async notifyItinerarySubmitted(itineraryId: string) {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id: itineraryId },
      include: {
        owner: {
          include: { sbu: { include: { head: true } } }
        }
      }
    });

    if (!itinerary?.owner.sbu?.head) return;

    const subject = `Itinerary Submitted for Approval`;
    const body = `${itinerary.owner.name} has submitted their ${itinerary.type} itinerary for week starting ${itinerary.weekStart.toDateString()}.`;

    await this.sendNotification(
      itinerary.owner.sbu.head.id,
      [NotificationChannel.SYSTEM, NotificationChannel.EMAIL],
      subject,
      body,
      { itineraryId, type: 'itinerary_submitted' }
    );
  }

  async notifyItineraryDecision(itineraryId: string, approved: boolean) {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id: itineraryId },
      include: {
        owner: true,
        approver: { select: { name: true } }
      }
    });

    if (!itinerary) return;

    const subject = `Itinerary ${approved ? 'Approved' : 'Rejected'}`;
    const body = `Your ${itinerary.type} itinerary for week starting ${itinerary.weekStart.toDateString()} has been ${approved ? 'approved' : 'rejected'} by ${itinerary.approver?.name}.`;

    await this.sendNotification(
      itinerary.ownerUserId,
      [NotificationChannel.SYSTEM, NotificationChannel.EMAIL],
      subject,
      body,
      { itineraryId, type: 'itinerary_decision', approved }
    );
  }
}
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailProvider {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransporter({
      host: this.configService.get('SMTP_HOST'),
      port: parseInt(this.configService.get('SMTP_PORT', '587')),
      secure: this.configService.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    body: string,
    recipientName?: string
  ): Promise<void> {
    const emailEnabled = this.configService.get('EMAIL_ENABLED') === 'true';
    
    if (!emailEnabled) {
      console.log(`[EMAIL DISABLED] Would send to ${to}: ${subject}`);
      return;
    }

    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #2c3e50; margin-bottom: 20px;">Freight Pricing System</h2>
            ${recipientName ? `<p>Dear ${recipientName},</p>` : ''}
            <div style="background-color: white; padding: 20px; border-radius: 4px; margin: 20px 0;">
              <p style="line-height: 1.6; color: #333;">${body}</p>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              This is an automated message from the Freight Pricing System. Please do not reply to this email.
            </p>
          </div>
        </div>
      `;

      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM'),
        to,
        subject,
        html,
      });

      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
}
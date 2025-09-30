import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsProvider {
  constructor(private configService: ConfigService) {}

  async sendSms(to: string, message: string): Promise<void> {
    const smsEnabled = this.configService.get('SMS_ENABLED') === 'true';
    const provider = this.configService.get('SMS_PROVIDER', 'dummy');
    
    if (!smsEnabled) {
      console.log(`[SMS DISABLED] Would send to ${to}: ${message}`);
      return;
    }

    try {
      switch (provider) {
        case 'twilio':
          await this.sendViaTwilio(to, message);
          break;
        case 'dummy':
        default:
          await this.sendViaDummy(to, message);
          break;
      }

      console.log(`SMS sent successfully to ${to}`);
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw error;
    }
  }

  private async sendViaTwilio(to: string, message: string): Promise<void> {
    // Implement Twilio SMS sending
    // const twilio = require('twilio');
    // const client = twilio(accountSid, authToken);
    // await client.messages.create({ body: message, from: '+1234567890', to });
    
    console.log(`[TWILIO] SMS to ${to}: ${message}`);
  }

  private async sendViaDummy(to: string, message: string): Promise<void> {
    // Dummy implementation for testing
    console.log(`[DUMMY SMS] To: ${to}, Message: ${message}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
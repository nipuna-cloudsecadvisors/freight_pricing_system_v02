import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private client: twilio.Twilio;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    
    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    }
  }

  async send({ to, message }: { to: string; message: string }) {
    if (!this.client) {
      console.log(`SMS would be sent to ${to}: ${message}`);
      return;
    }

    const from = this.configService.get<string>('TWILIO_PHONE_NUMBER');
    
    return this.client.messages.create({
      body: message,
      from,
      to,
    });
  }
}
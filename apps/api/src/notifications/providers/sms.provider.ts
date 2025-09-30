import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsProvider {
  constructor(private configService: ConfigService) {}

  async sendSms(to: string, message: string): Promise<boolean> {
    const provider = this.configService.get<string>('SMS_PROVIDER', 'dummy');
    
    switch (provider) {
      case 'dummy':
        return this.sendDummySms(to, message);
      case 'twilio':
        return this.sendTwilioSms(to, message);
      default:
        console.log(`SMS to ${to}: ${message}`);
        return true;
    }
  }

  private async sendDummySms(to: string, message: string): Promise<boolean> {
    console.log(`[DUMMY SMS] To: ${to}, Message: ${message}`);
    return true;
  }

  private async sendTwilioSms(to: string, message: string): Promise<boolean> {
    // TODO: Implement Twilio SMS integration
    console.log(`[TWILIO SMS] To: ${to}, Message: ${message}`);
    return true;
  }
}

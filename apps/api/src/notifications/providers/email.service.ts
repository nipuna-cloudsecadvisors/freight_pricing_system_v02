import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransporter({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async send({ to, subject, text, html }: { 
    to: string; 
    subject: string; 
    text: string; 
    html?: string; 
  }) {
    const from = this.configService.get<string>('SMTP_FROM');
    
    return this.transporter.sendMail({
      from,
      to,
      subject,
      text,
      html: html || text,
    });
  }
}
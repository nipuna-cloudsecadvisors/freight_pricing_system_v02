import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { RatesService } from './rates.service';
import { RatesController } from './rates.controller';
import { PredefinedRatesService } from './predefined-rates.service';
import { RateRequestsService } from './rate-requests.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
    NotificationsModule,
  ],
  providers: [RatesService, PredefinedRatesService, RateRequestsService],
  controllers: [RatesController],
  exports: [RatesService, PredefinedRatesService, RateRequestsService],
})
export class RatesModule {}
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { RatesService } from './rates.service';
import { RatesController } from './rates.controller';
import { NotificationsService } from '../../notifications/notifications.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  providers: [RatesService, NotificationsService],
  controllers: [RatesController],
  exports: [RatesService],
})
export class RatesModule {}

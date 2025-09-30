import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';

// Business modules
import { UsersModule } from './modules/users/users.module';
import { CustomersModule } from './modules/customers/customers.module';
import { MastersModule } from './modules/masters/masters.module';
import { RatesModule } from './modules/rates/rates.module';
import { BookingModule } from './modules/booking/booking.module';
import { ItinerariesModule } from './modules/itineraries/itineraries.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { ReportsModule } from './modules/reports/reports.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Queue system
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),

    // Core modules
    DatabaseModule,
    AuthModule,
    NotificationsModule,

    // Business modules
    UsersModule,
    CustomersModule,
    MastersModule,
    RatesModule,
    BookingModule,
    ItinerariesModule,
    ActivitiesModule,
    ReportsModule,
    DashboardModule,
  ],
})
export class AppModule {}

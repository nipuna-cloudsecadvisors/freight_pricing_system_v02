import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class WorkerService implements OnModuleInit {
  private redis: Redis;
  private notificationQueue: Queue;
  private worker: Worker;

  constructor(
    private configService: ConfigService,
    private notificationsService: NotificationsService,
  ) {
    this.redis = new Redis(this.configService.get('REDIS_URL'));
    this.notificationQueue = new Queue('notifications', { connection: this.redis });
  }

  async onModuleInit() {
    this.worker = new Worker(
      'notifications',
      async (job) => {
        console.log(`Processing job: ${job.name}`, job.data);
        
        switch (job.name) {
          case 'rate-request-created':
            await this.notificationsService.notifyRateRequestCreated(job.data.rateRequestId);
            break;
          case 'rate-request-response':
            await this.notificationsService.notifyRateRequestResponse(job.data.rateRequestId);
            break;
          case 'itinerary-submitted':
            await this.notificationsService.notifyItinerarySubmitted(job.data.itineraryId);
            break;
          case 'itinerary-decision':
            await this.notificationsService.notifyItineraryDecision(
              job.data.itineraryId,
              job.data.approved
            );
            break;
          default:
            console.log(`Unknown job type: ${job.name}`);
        }
      },
      { connection: this.redis }
    );

    this.worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed:`, err);
    });

    console.log('✅ Worker initialized and listening for jobs');
  }

  async addJob(name: string, data: any, options?: any) {
    return this.notificationQueue.add(name, data, options);
  }
}
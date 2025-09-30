import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { NotificationProcessor } from '../notifications/processors/notification.processor';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  console.log('🔄 Worker started successfully');
  console.log('📧 Processing notification jobs...');
  
  // Keep the worker running
  process.on('SIGINT', async () => {
    console.log('🛑 Worker shutting down...');
    await app.close();
    process.exit(0);
  });
}

bootstrap();

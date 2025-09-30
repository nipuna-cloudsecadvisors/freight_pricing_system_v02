import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule);
  
  console.log('🔄 Background worker started');
  
  // Keep the process running
  process.on('SIGINT', async () => {
    console.log('🛑 Worker shutting down...');
    await app.close();
    process.exit(0);
  });
}

bootstrap();
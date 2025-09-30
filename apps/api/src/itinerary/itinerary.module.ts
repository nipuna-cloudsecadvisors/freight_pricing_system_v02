import { Module } from '@nestjs/common';
import { ItineraryService } from './itinerary.service';
import { ItineraryController } from './itinerary.controller';

@Module({
  providers: [ItineraryService],
  controllers: [ItineraryController],
  exports: [ItineraryService],
})
export class ItineraryModule {}
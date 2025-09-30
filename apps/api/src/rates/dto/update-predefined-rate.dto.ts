import { PartialType } from '@nestjs/swagger';
import { CreatePredefinedRateDto } from './create-predefined-rate.dto';

export class UpdatePredefinedRateDto extends PartialType(CreatePredefinedRateDto) {}
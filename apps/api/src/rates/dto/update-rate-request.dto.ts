import { PartialType } from '@nestjs/swagger';
import { CreateRateRequestDto } from './create-rate-request.dto';

export class UpdateRateRequestDto extends PartialType(CreateRateRequestDto) {}
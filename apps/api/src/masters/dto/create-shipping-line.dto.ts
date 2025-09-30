import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShippingLineDto {
  @ApiProperty({ example: 'Maersk Line' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'MAEU' })
  @IsString()
  @MinLength(2)
  code: string;
}
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTradeLaneDto {
  @ApiProperty({ example: 'Asia' })
  @IsString()
  @MinLength(2)
  region: string;

  @ApiProperty({ example: 'Colombo to Singapore' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'CMB-SIN' })
  @IsString()
  @MinLength(2)
  code: string;
}
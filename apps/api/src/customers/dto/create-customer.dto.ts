import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: 'ABC Trading Company' })
  @IsString()
  @MinLength(2)
  companyName: string;

  @ApiProperty({ example: 'John Smith' })
  @IsString()
  @MinLength(2)
  contactName: string;

  @ApiProperty({ example: 'john.smith@abctrading.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+94771234567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '123 Main Street, Colombo 01', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Colombo', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Sri Lanka', required: false })
  @IsOptional()
  @IsString()
  country?: string;
}
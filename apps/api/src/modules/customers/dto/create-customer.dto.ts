import { IsString, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: 'ABC Trading Company' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  contactPerson: string;

  @ApiProperty({ example: 'john@abctrading.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+94 77 123 4567', required: false })
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

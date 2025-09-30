import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Ceylon Tea Exports Ltd' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'info@ceylontea.lk', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+94112345678', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '123 Export House, Colombo 01', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Mr. Sunil Perera', required: false })
  @IsOptional()
  @IsString()
  contactPerson?: string;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
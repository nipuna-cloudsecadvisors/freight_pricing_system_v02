import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRODocumentDto {
  @ApiProperty({ example: 'RO-2024-001' })
  @IsString()
  number: string;

  @ApiProperty({ example: 'https://example.com/ro-document.pdf', required: false })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiProperty({ example: '2024-02-15T10:00:00Z' })
  @IsDateString()
  receivedAt: string;
}
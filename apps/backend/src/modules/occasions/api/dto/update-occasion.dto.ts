import { OccasionType } from '@prisma/client';
import { IsArray, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateOccasionDto {
  @IsOptional()
  @IsEnum(OccasionType)
  type?: OccasionType;

  @IsOptional()
  @IsDateString()
  datetime?: string;

  @IsOptional()
  @IsString()
  audience?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  impressionPrimary?: string;

  @IsOptional()
  @IsString()
  impressionSecondary?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredItemIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedItemIds?: string[];

  @IsOptional()
  constraints?: Record<string, unknown>;
}

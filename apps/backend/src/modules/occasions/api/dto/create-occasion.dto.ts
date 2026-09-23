import { OccasionType } from '@prisma/client';
import { IsArray, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateOccasionDto {
  @IsEnum(OccasionType)
  type!: OccasionType;

  @IsDateString()
  datetime!: string;

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

  @IsArray()
  @IsString({ each: true })
  requiredItemIds!: string[];

  @IsArray()
  @IsString({ each: true })
  excludedItemIds!: string[];

  @IsOptional()
  constraints?: Record<string, unknown>;
}

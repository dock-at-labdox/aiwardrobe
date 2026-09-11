import { WardrobeCategory } from '@prisma/client';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateWardrobeItemDto {
  @IsOptional()
  @IsEnum(WardrobeCategory)
  category?: WardrobeCategory;

  @IsOptional()
  @IsString()
  subtype?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, unknown>;
}

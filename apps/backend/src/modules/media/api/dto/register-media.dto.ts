import { IsEnum, IsISO8601, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { MediaAssetType } from '@prisma/client';

export class RegisterMediaDto {
  @IsEnum(MediaAssetType)
  assetType!: MediaAssetType;

  @IsString()
  @MaxLength(1024)
  objectKey!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  hash?: string;

  @IsOptional()
  @IsObject()
  deviceMetadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  retentionClass?: string;

  @IsOptional()
  @IsISO8601()
  expiresAt?: string;
}

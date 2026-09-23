import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateBodyProfileDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  heightCm?: number;

  @IsOptional()
  @IsString()
  buildDescriptor?: string;

  @IsOptional()
  @IsString()
  undertone?: string;

  @IsString()
  source!: string;

  @IsOptional()
  @IsBoolean()
  userConfirmed?: boolean;
}

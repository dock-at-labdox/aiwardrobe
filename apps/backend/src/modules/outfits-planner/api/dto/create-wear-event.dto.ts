import { IsDateString, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateWearEventDto {
  @IsString()
  savedLookId!: string;

  @IsDateString()
  wornAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  audienceKey?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SaveOutfitDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;
}

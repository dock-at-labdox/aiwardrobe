import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class CreateRecommendationDto {
  @IsUUID()
  occasionId!: string;

  @IsArray()
  @IsOptional()
  requiredItemIds?: string[];

  @IsArray()
  @IsOptional()
  excludedItemIds?: string[];
}

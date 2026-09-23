import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum FeedbackTargetType {
  OUTFIT = 'OUTFIT',
  TRYON_RESULT = 'TRYON_RESULT',
  RECOMMENDATION = 'RECOMMENDATION',
}

export class CreateFeedbackDto {
  @IsEnum(FeedbackTargetType)
  targetType!: FeedbackTargetType;

  @IsString()
  @IsNotEmpty()
  targetId!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}

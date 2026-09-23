import { Prisma, PresentationStyle } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateStyleProfileDto {
  @IsEnum(PresentationStyle)
  presentationStyle!: PresentationStyle;

  @IsArray()
  @IsString({ each: true })
  industries!: string[];

  @IsOptional()
  @IsString()
  formalityDefault?: string;

  @IsOptional()
  fitPreferences?: Prisma.InputJsonValue;
}

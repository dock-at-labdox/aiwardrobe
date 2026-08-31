import { ConsentPurpose, ConsentStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateConsentDto {
  @IsEnum(ConsentPurpose)
  purpose!: ConsentPurpose;

  @IsEnum(ConsentStatus)
  status!: ConsentStatus;
}

import { Module } from '@nestjs/common';

import { IdentityConsentModule } from '../identity-consent/identity-consent.module';
import { OccasionsController } from './api/occasions.controller';
import { OccasionsService } from './application/occasions.service';

@Module({
  imports: [IdentityConsentModule],
  controllers: [OccasionsController],
  providers: [OccasionsService],
  exports: [OccasionsService],
})
export class OccasionsModule {}

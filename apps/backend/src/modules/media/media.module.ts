import { Module } from '@nestjs/common';

import { IdentityConsentModule } from '../identity-consent/identity-consent.module';
import { MediaController } from './api/controllers/media.controller';
import { MediaService } from './application/media.service';

@Module({
  imports: [IdentityConsentModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}

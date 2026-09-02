import { Module } from '@nestjs/common';
import { IdentityConsentModule } from '../identity-consent/identity-consent.module';
import { ProfilesController } from './api/profiles.controller';
import { ProfilesService } from './application/profiles.service';

@Module({
  imports: [IdentityConsentModule],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { WardrobeController } from './api/controllers/wardrobe.controller';
import { WardrobeService } from './application/wardrobe.service';
import { IdentityConsentModule } from '../identity-consent/identity-consent.module';

@Module({
  imports: [PrismaModule, IdentityConsentModule],
  controllers: [WardrobeController],
  providers: [WardrobeService],
  exports: [WardrobeService],
})
export class WardrobeModule {}

import { Module } from '@nestjs/common';

import { IdentityConsentModule } from '../identity-consent/identity-consent.module';
import { OutfitsController } from './api/outfits.controller';
import { WearEventsController } from './api/wear-events.controller';
import { CreateWearEventService } from './application/create-wear-event.service';
import { SaveOutfitService } from './application/save-outfit.service';
import { OUTFITS_PLANNER_REPOSITORY } from './domain/outfits-planner.repository';
import { PrismaOutfitsPlannerRepository } from './infrastructure/prisma-outfits-planner.repository';

@Module({
  imports: [IdentityConsentModule],
  controllers: [OutfitsController, WearEventsController],
  providers: [
    SaveOutfitService,
    CreateWearEventService,
    {
      provide: OUTFITS_PLANNER_REPOSITORY,
      useClass: PrismaOutfitsPlannerRepository,
    },
  ],
  exports: [SaveOutfitService, CreateWearEventService],
})
export class OutfitsPlannerModule {}

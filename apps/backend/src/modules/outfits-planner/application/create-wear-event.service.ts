import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WearEvent } from '@prisma/client';

import {
  OUTFITS_PLANNER_REPOSITORY,
  OutfitsPlannerRepository,
} from '../domain/outfits-planner.repository';

@Injectable()
export class CreateWearEventService {
  constructor(
    @Inject(OUTFITS_PLANNER_REPOSITORY)
    private readonly repository: OutfitsPlannerRepository,
  ) {}

  async execute(params: {
    savedLookId: string;
    userId: string;
    wornAt: Date;
    audienceKey?: string;
    rating?: number;
    notes?: string;
  }): Promise<WearEvent> {
    const savedLookExists = await this.repository.findSavedLookByIdForUser({
      savedLookId: params.savedLookId,
      userId: params.userId,
    });

    if (!savedLookExists) {
      throw new NotFoundException('Saved look not found');
    }

    return this.repository.createWearEvent({
      savedLookId: params.savedLookId,
      userId: params.userId,
      wornAt: params.wornAt,
      audienceKey: params.audienceKey,
      rating: params.rating,
      notes: params.notes,
    });
  }
}

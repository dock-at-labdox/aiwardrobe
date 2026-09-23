import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SavedLook } from '@prisma/client';

import {
  OUTFITS_PLANNER_REPOSITORY,
  OutfitsPlannerRepository,
} from '../domain/outfits-planner.repository';

@Injectable()
export class SaveOutfitService {
  constructor(
    @Inject(OUTFITS_PLANNER_REPOSITORY)
    private readonly repository: OutfitsPlannerRepository,
  ) {}

  async execute(params: { outfitId: string; userId: string; title?: string }): Promise<SavedLook> {
    const outfitExists = await this.repository.findOutfitByIdForUser({
      outfitId: params.outfitId,
      userId: params.userId,
    });

    if (!outfitExists) {
      throw new NotFoundException('Outfit not found');
    }

    return this.repository.createSavedLook({
      outfitId: params.outfitId,
      userId: params.userId,
      title: params.title,
    });
  }
}

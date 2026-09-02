import { SavedLook, WearEvent } from '@prisma/client';

export const OUTFITS_PLANNER_REPOSITORY = Symbol('OUTFITS_PLANNER_REPOSITORY');

export interface OutfitsPlannerRepository {
  findOutfitByIdForUser(params: { outfitId: string; userId: string }): Promise<boolean>;

  findSavedLookByIdForUser(params: { savedLookId: string; userId: string }): Promise<boolean>;

  createSavedLook(params: { outfitId: string; userId: string; title?: string }): Promise<SavedLook>;

  createWearEvent(params: {
    savedLookId: string;
    userId: string;
    wornAt: Date;
    audienceKey?: string;
    rating?: number;
    notes?: string;
  }): Promise<WearEvent>;
}

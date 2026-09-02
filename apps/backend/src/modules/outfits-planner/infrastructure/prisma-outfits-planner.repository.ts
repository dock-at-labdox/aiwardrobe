import { Injectable } from '@nestjs/common';
import { SavedLook, WearEvent } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { OutfitsPlannerRepository } from '../domain/outfits-planner.repository';

@Injectable()
export class PrismaOutfitsPlannerRepository implements OutfitsPlannerRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findOutfitByIdForUser(params: { outfitId: string; userId: string }): Promise<boolean> {
    const outfit = await this.prisma.outfit.findFirst({
      where: {
        id: params.outfitId,
        userId: params.userId,
      },
      select: {
        id: true,
      },
    });

    return outfit !== null;
  }

  async findSavedLookByIdForUser(params: {
    savedLookId: string;
    userId: string;
  }): Promise<boolean> {
    const savedLook = await this.prisma.savedLook.findFirst({
      where: {
        id: params.savedLookId,
        userId: params.userId,
      },
      select: {
        id: true,
      },
    });

    return savedLook !== null;
  }

  async createSavedLook(params: {
    outfitId: string;
    userId: string;
    title?: string;
  }): Promise<SavedLook> {
    return this.prisma.savedLook.create({
      data: {
        outfitId: params.outfitId,
        userId: params.userId,
        title: params.title,
      },
    });
  }

  async createWearEvent(params: {
    savedLookId: string;
    userId: string;
    wornAt: Date;
    audienceKey?: string;
    rating?: number;
    notes?: string;
  }): Promise<WearEvent> {
    return this.prisma.wearEvent.create({
      data: {
        savedLookId: params.savedLookId,
        userId: params.userId,
        wornAt: params.wornAt,
        audienceKey: params.audienceKey,
        rating: params.rating,
        notes: params.notes,
      },
    });
  }
}

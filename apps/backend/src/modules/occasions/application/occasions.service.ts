import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, OccasionType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class OccasionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    data: {
      type: OccasionType;
      datetime: string;
      audience?: string;
      industry?: string;
      impressionPrimary?: string;
      impressionSecondary?: string;
      requiredItemIds: string[];
      excludedItemIds: string[];
      constraints?: Record<string, unknown>;
    },
  ) {
    return this.prisma.occasion.create({
      data: {
        userId,
        type: data.type,
        datetime: new Date(data.datetime),
        audience: data.audience,
        industry: data.industry,
        impressionPrimary: data.impressionPrimary,
        impressionSecondary: data.impressionSecondary,
        requiredItemIds: data.requiredItemIds,
        excludedItemIds: data.excludedItemIds,
        constraints: data.constraints as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.occasion.findMany({
      where: {
        userId,
        archivedAt: null,
      },
      orderBy: {
        datetime: 'asc',
      },
    });
  }

  async findOne(userId: string, occasionId: string) {
    const occasion = await this.prisma.occasion.findFirst({
      where: {
        id: occasionId,
        userId,
        archivedAt: null,
      },
    });

    if (!occasion) {
      throw new NotFoundException('Occasion not found');
    }

    return occasion;
  }

  async update(
    userId: string,
    occasionId: string,
    data: {
      type?: OccasionType;
      datetime?: string;
      audience?: string;
      industry?: string;
      impressionPrimary?: string;
      impressionSecondary?: string;
      requiredItemIds?: string[];
      excludedItemIds?: string[];
      constraints?: Record<string, unknown>;
    },
  ) {
    await this.findOne(userId, occasionId);

    return this.prisma.occasion.update({
      where: {
        id: occasionId,
      },
      data: {
        type: data.type,
        datetime: data.datetime ? new Date(data.datetime) : undefined,
        audience: data.audience,
        industry: data.industry,
        impressionPrimary: data.impressionPrimary,
        impressionSecondary: data.impressionSecondary,
        requiredItemIds: data.requiredItemIds,
        excludedItemIds: data.excludedItemIds,
        constraints: data.constraints as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async archive(userId: string, occasionId: string) {
    await this.findOne(userId, occasionId);

    return this.prisma.occasion.update({
      where: {
        id: occasionId,
      },
      data: {
        archivedAt: new Date(),
      },
    });
  }
}

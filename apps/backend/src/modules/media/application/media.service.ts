import { Injectable, NotFoundException } from '@nestjs/common';
import { MediaAssetType, Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export interface RegisterMediaAssetInput {
  assetType: MediaAssetType;
  objectKey: string;
  hash?: string;
  deviceMetadata?: Prisma.InputJsonValue;
  retentionClass?: string;
  expiresAt?: Date;
}

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async register(userId: string, input: RegisterMediaAssetInput) {
    return this.prisma.mediaAsset.create({
      data: {
        userId,
        assetType: input.assetType,
        objectKey: input.objectKey,
        hash: input.hash,
        deviceMetadata: input.deviceMetadata,
        retentionClass: input.retentionClass,
        expiresAt: input.expiresAt,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.mediaAsset.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(userId: string, assetId: string) {
    const asset = await this.prisma.mediaAsset.findFirst({
      where: {
        id: assetId,
        userId,
        deletedAt: null,
      },
    });

    if (!asset) {
      throw new NotFoundException('Media asset not found');
    }

    return asset;
  }

  async remove(userId: string, assetId: string) {
    const asset = await this.findOne(userId, assetId);

    return this.prisma.mediaAsset.update({
      where: { id: asset.id },
      data: { deletedAt: new Date() },
    });
  }
}

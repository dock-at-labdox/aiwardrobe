import { MediaAssetType } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';
import { MediaService } from '../application/media.service';

describe('MediaService', () => {
  let service: MediaService;

  const prisma = {
    mediaAsset: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MediaService(prisma as unknown as PrismaService);
  });

  it('registers an asset for the given user', async () => {
    const input = {
      assetType: MediaAssetType.WARDROBE_RAW,
      objectKey: 'user-1/asset-1.jpg',
      hash: 'hash-123',
    };

    const asset = {
      id: 'asset-1',
      userId: 'user-1',
      ...input,
    };

    prisma.mediaAsset.create.mockResolvedValue(asset);

    const result = await service.register('user-1', input);

    expect(prisma.mediaAsset.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        assetType: input.assetType,
        objectKey: input.objectKey,
        hash: input.hash,
        deviceMetadata: undefined,
        retentionClass: undefined,
        expiresAt: undefined,
      },
    });
    expect(result).toEqual(asset);
  });

  it('lists only non-deleted assets belonging to the user', async () => {
    const assets = [{ id: 'asset-1', userId: 'user-1' }];
    prisma.mediaAsset.findMany.mockResolvedValue(assets);

    const result = await service.findAll('user-1');

    expect(prisma.mediaAsset.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toEqual(assets);
  });

  it('does not return an asset owned by another user', async () => {
    prisma.mediaAsset.findFirst.mockResolvedValue(null);

    await expect(service.findOne('user-1', 'asset-1')).rejects.toThrow(NotFoundException);

    expect(prisma.mediaAsset.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'asset-1',
        userId: 'user-1',
        deletedAt: null,
      },
    });
  });

  it('soft-deletes an asset owned by the user', async () => {
    prisma.mediaAsset.findFirst.mockResolvedValue({
      id: 'asset-1',
      userId: 'user-1',
    });

    const deletedAsset = {
      id: 'asset-1',
      userId: 'user-1',
      deletedAt: new Date(),
    };
    prisma.mediaAsset.update.mockResolvedValue(deletedAsset);

    const result = await service.remove('user-1', 'asset-1');

    expect(prisma.mediaAsset.update).toHaveBeenCalledWith({
      where: { id: 'asset-1' },
      data: { deletedAt: expect.any(Date) },
    });
    expect(result).toEqual(deletedAsset);
  });
});

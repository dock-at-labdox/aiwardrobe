import { NotFoundException } from '@nestjs/common';
import { OccasionType } from '@prisma/client';
import { OccasionsService } from './occasions.service';

describe('OccasionsService', () => {
  let service: OccasionsService;

  const prisma = {
    occasion: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OccasionsService(prisma as any);
  });

  it('creates an occasion for the authenticated user', async () => {
    const occasion = {
      id: 'occasion-1',
      userId: 'user-1',
      type: OccasionType.CLIENT_MEETING,
    };

    prisma.occasion.create.mockResolvedValue(occasion);

    const result = await service.create('user-1', {
      type: OccasionType.CLIENT_MEETING,
      datetime: '2026-09-10T10:00:00.000Z',
      requiredItemIds: [],
      excludedItemIds: [],
    });

    expect(prisma.occasion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          type: OccasionType.CLIENT_MEETING,
        }),
      }),
    );

    expect(result).toEqual(occasion);
  });

  it('lists only active occasions for the authenticated user', async () => {
    prisma.occasion.findMany.mockResolvedValue([]);

    await service.findAll('user-1');

    expect(prisma.occasion.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        archivedAt: null,
      },
      orderBy: {
        datetime: 'asc',
      },
    });
  });

  it('throws when an occasion does not belong to the authenticated user', async () => {
    prisma.occasion.findFirst.mockResolvedValue(null);

    await expect(service.findOne('user-1', 'occasion-1')).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.occasion.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'occasion-1',
        userId: 'user-1',
        archivedAt: null,
      },
    });
  });

  it('archives an occasion instead of deleting it', async () => {
    prisma.occasion.findFirst.mockResolvedValue({
      id: 'occasion-1',
      userId: 'user-1',
    });

    prisma.occasion.update.mockResolvedValue({
      id: 'occasion-1',
      archivedAt: new Date(),
    });

    await service.archive('user-1', 'occasion-1');

    expect(prisma.occasion.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'occasion-1',
        },
        data: expect.objectContaining({
          archivedAt: expect.any(Date),
        }),
      }),
    );
  });
});

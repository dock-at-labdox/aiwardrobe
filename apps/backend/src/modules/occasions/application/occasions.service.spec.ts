import { NotFoundException } from '@nestjs/common';
import { OccasionType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
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
    service = new OccasionsService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
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
        requiredItemIds: ['item-1'],
        excludedItemIds: ['item-2'],
      });

      expect(prisma.occasion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            type: OccasionType.CLIENT_MEETING,
            datetime: new Date('2026-09-10T10:00:00.000Z'),
            requiredItemIds: ['item-1'],
            excludedItemIds: ['item-2'],
          }),
        }),
      );

      expect(result).toEqual(occasion);
    });
  });

  describe('findAll', () => {
    it('lists only active occasions for the authenticated user', async () => {
      const occasions = [
        {
          id: 'occasion-1',
          userId: 'user-1',
          archivedAt: null,
        },
      ];

      prisma.occasion.findMany.mockResolvedValue(occasions);

      const result = await service.findAll('user-1');

      expect(prisma.occasion.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          archivedAt: null,
        },
        orderBy: {
          datetime: 'asc',
        },
      });

      expect(result).toEqual(occasions);
    });
  });

  describe('findOne', () => {
    it('returns an active occasion belonging to the authenticated user', async () => {
      const occasion = {
        id: 'occasion-1',
        userId: 'user-1',
        archivedAt: null,
      };

      prisma.occasion.findFirst.mockResolvedValue(occasion);

      const result = await service.findOne('user-1', 'occasion-1');

      expect(prisma.occasion.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'occasion-1',
          userId: 'user-1',
          archivedAt: null,
        },
      });

      expect(result).toEqual(occasion);
    });

    it("does not allow access to another user's occasion", async () => {
      prisma.occasion.findFirst.mockResolvedValue(null);

      await expect(service.findOne('user-1', 'occasion-owned-by-user-2')).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(prisma.occasion.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'occasion-owned-by-user-2',
          userId: 'user-1',
          archivedAt: null,
        },
      });
    });

    it('does not return archived occasions', async () => {
      prisma.occasion.findFirst.mockResolvedValue(null);

      await expect(service.findOne('user-1', 'archived-occasion')).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(prisma.occasion.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'archived-occasion',
          userId: 'user-1',
          archivedAt: null,
        },
      });
    });
  });

  describe('update', () => {
    it('updates an occasion belonging to the authenticated user', async () => {
      prisma.occasion.findFirst.mockResolvedValue({
        id: 'occasion-1',
        userId: 'user-1',
        archivedAt: null,
      });

      const updatedOccasion = {
        id: 'occasion-1',
        userId: 'user-1',
        type: OccasionType.INTERVIEW,
      };

      prisma.occasion.update.mockResolvedValue(updatedOccasion);

      const result = await service.update('user-1', 'occasion-1', {
        type: OccasionType.INTERVIEW,
        datetime: '2026-09-12T14:00:00.000Z',
        audience: 'Client',
      });

      expect(prisma.occasion.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'occasion-1',
          userId: 'user-1',
          archivedAt: null,
        },
      });

      expect(prisma.occasion.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'occasion-1',
          },
          data: expect.objectContaining({
            type: OccasionType.INTERVIEW,
            datetime: new Date('2026-09-12T14:00:00.000Z'),
            audience: 'Client',
          }),
        }),
      );

      expect(result).toEqual(updatedOccasion);
    });

    it('does not update an occasion that does not belong to the authenticated user', async () => {
      prisma.occasion.findFirst.mockResolvedValue(null);

      await expect(
        service.update('user-1', 'occasion-2', {
          type: OccasionType.INTERVIEW,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.occasion.update).not.toHaveBeenCalled();
    });
  });

  describe('archive', () => {
    it('archives an occasion instead of deleting it', async () => {
      prisma.occasion.findFirst.mockResolvedValue({
        id: 'occasion-1',
        userId: 'user-1',
        archivedAt: null,
      });

      const archivedOccasion = {
        id: 'occasion-1',
        userId: 'user-1',
        archivedAt: new Date(),
      };

      prisma.occasion.update.mockResolvedValue(archivedOccasion);

      const result = await service.archive('user-1', 'occasion-1');

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

      expect(result).toEqual(archivedOccasion);
    });

    it('does not archive an occasion that does not belong to the authenticated user', async () => {
      prisma.occasion.findFirst.mockResolvedValue(null);

      await expect(service.archive('user-1', 'occasion-2')).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(prisma.occasion.update).not.toHaveBeenCalled();
    });
  });
});

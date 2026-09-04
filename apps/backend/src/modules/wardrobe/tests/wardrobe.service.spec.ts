import { WardrobeCategory } from '@prisma/client';
import { WardrobeService } from '../application/wardrobe.service';
import { PrismaService } from '../../../prisma/prisma.service';
describe('WardrobeService', () => {
  let service: WardrobeService;

  const prisma = {
    wardrobeItem: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WardrobeService(prisma as unknown as PrismaService);
  });

  it('creates a wardrobe item for the given user', async () => {
    const dto = {
      category: WardrobeCategory.TOP,
      subtype: 'T-Shirt',
      name: 'Blue T-Shirt',
      attributes: { color: 'blue' },
    };

    const createdItem = {
      id: 'item-1',
      userId: 'user-1',
      ...dto,
    };

    prisma.wardrobeItem.create.mockResolvedValue(createdItem);

    const result = await service.create('user-1', dto);

    expect(prisma.wardrobeItem.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        category: dto.category,
        subtype: dto.subtype,
        name: dto.name,
        attributes: dto.attributes,
      },
    });

    expect(result).toEqual(createdItem);
  });

  it('returns only active items belonging to the user', async () => {
    const items = [
      {
        id: 'item-1',
        userId: 'user-1',
        category: WardrobeCategory.TOP,
      },
    ];

    prisma.wardrobeItem.findMany.mockResolvedValue(items);

    const result = await service.findAll('user-1');

    expect(prisma.wardrobeItem.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    expect(result).toEqual(items);
  });

  it('does not update an item belonging to another user', async () => {
    prisma.wardrobeItem.findFirst.mockResolvedValue(null);

    const result = await service.update('user-1', 'item-1', {
      name: 'Updated',
    });

    expect(prisma.wardrobeItem.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'item-1',
        userId: 'user-1',
        deletedAt: null,
      },
    });

    expect(prisma.wardrobeItem.update).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('soft deletes an item belonging to the user', async () => {
    prisma.wardrobeItem.findFirst.mockResolvedValue({
      id: 'item-1',
      userId: 'user-1',
    });

    prisma.wardrobeItem.update.mockResolvedValue({
      id: 'item-1',
      userId: 'user-1',
      deletedAt: new Date(),
    });

    const result = await service.remove('user-1', 'item-1');

    expect(prisma.wardrobeItem.update).toHaveBeenCalledWith({
      where: {
        id: 'item-1',
      },
      data: {
        deletedAt: expect.any(Date),
      },
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: 'item-1',
        userId: 'user-1',
      }),
    );
  });
});

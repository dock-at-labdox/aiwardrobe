import { NotFoundException } from '@nestjs/common';
import { SavedLook } from '@prisma/client';

import { SaveOutfitService } from '../application/save-outfit.service';
import { OutfitsPlannerRepository } from '../domain/outfits-planner.repository';

describe('SaveOutfitService', () => {
  let service: SaveOutfitService;
  let repository: jest.Mocked<OutfitsPlannerRepository>;

  beforeEach(() => {
    repository = {
      findOutfitByIdForUser: jest.fn(),
      findSavedLookByIdForUser: jest.fn(),
      createSavedLook: jest.fn(),
      createWearEvent: jest.fn(),
    };

    service = new SaveOutfitService(repository);
  });

  it('saves an outfit owned by the user', async () => {
    const savedLook = {
      id: 'saved-look-1',
      outfitId: 'outfit-1',
      userId: 'user-1',
    } as SavedLook;

    repository.findOutfitByIdForUser.mockResolvedValue(true);
    repository.createSavedLook.mockResolvedValue(savedLook);

    const result = await service.execute({
      outfitId: 'outfit-1',
      userId: 'user-1',
      title: 'My look',
    });

    expect(repository.findOutfitByIdForUser).toHaveBeenCalledWith({
      outfitId: 'outfit-1',
      userId: 'user-1',
    });

    expect(repository.createSavedLook).toHaveBeenCalledWith({
      outfitId: 'outfit-1',
      userId: 'user-1',
      title: 'My look',
    });

    expect(result).toBe(savedLook);
  });

  it('rejects an outfit that does not belong to the user', async () => {
    repository.findOutfitByIdForUser.mockResolvedValue(false);

    await expect(
      service.execute({
        outfitId: 'outfit-1',
        userId: 'user-1',
      }),
    ).rejects.toThrow(new NotFoundException('Outfit not found'));

    expect(repository.createSavedLook).not.toHaveBeenCalled();
  });
});

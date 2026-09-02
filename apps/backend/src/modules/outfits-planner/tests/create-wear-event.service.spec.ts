import { NotFoundException } from '@nestjs/common';
import { WearEvent } from '@prisma/client';

import { CreateWearEventService } from '../application/create-wear-event.service';
import { OutfitsPlannerRepository } from '../domain/outfits-planner.repository';

describe('CreateWearEventService', () => {
  let service: CreateWearEventService;
  let repository: jest.Mocked<OutfitsPlannerRepository>;

  beforeEach(() => {
    repository = {
      findOutfitByIdForUser: jest.fn(),
      findSavedLookByIdForUser: jest.fn(),
      createSavedLook: jest.fn(),
      createWearEvent: jest.fn(),
    };

    service = new CreateWearEventService(repository);
  });

  it('creates a wear event for a saved look owned by the user', async () => {
    const wearEvent = {
      id: 'wear-event-1',
      savedLookId: 'saved-look-1',
      userId: 'user-1',
    } as WearEvent;

    const wornAt = new Date('2026-09-02T00:00:00.000Z');

    repository.findSavedLookByIdForUser.mockResolvedValue(true);
    repository.createWearEvent.mockResolvedValue(wearEvent);

    const result = await service.execute({
      savedLookId: 'saved-look-1',
      userId: 'user-1',
      wornAt,
      audienceKey: 'work',
      rating: 5,
      notes: 'Felt great',
    });

    expect(repository.findSavedLookByIdForUser).toHaveBeenCalledWith({
      savedLookId: 'saved-look-1',
      userId: 'user-1',
    });

    expect(repository.createWearEvent).toHaveBeenCalledWith({
      savedLookId: 'saved-look-1',
      userId: 'user-1',
      wornAt,
      audienceKey: 'work',
      rating: 5,
      notes: 'Felt great',
    });

    expect(result).toBe(wearEvent);
  });

  it('rejects a saved look that does not belong to the user', async () => {
    repository.findSavedLookByIdForUser.mockResolvedValue(false);

    await expect(
      service.execute({
        savedLookId: 'saved-look-1',
        userId: 'user-1',
        wornAt: new Date('2026-09-02T00:00:00.000Z'),
      }),
    ).rejects.toThrow(new NotFoundException('Saved look not found'));

    expect(repository.createWearEvent).not.toHaveBeenCalled();
  });
});

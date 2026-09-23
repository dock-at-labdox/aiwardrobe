import { validate } from 'class-validator';
import { OccasionType } from '@prisma/client';
import { CreateOccasionDto } from './create-occasion.dto';
import { UpdateOccasionDto } from './update-occasion.dto';

describe('Occasion DTO validation', () => {
  describe('CreateOccasionDto', () => {
    it('accepts valid occasion data', async () => {
      const dto = Object.assign(new CreateOccasionDto(), {
        type: OccasionType.CLIENT_MEETING,
        datetime: '2026-09-10T10:00:00.000Z',
        audience: 'Client',
        industry: 'Technology',
        impressionPrimary: 'Professional',
        impressionSecondary: 'Confident',
        requiredItemIds: ['item-1'],
        excludedItemIds: ['item-2'],
        constraints: {
          colors: ['navy', 'white'],
        },
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('rejects an invalid occasion type', async () => {
      const dto = Object.assign(new CreateOccasionDto(), {
        type: 'INVALID_TYPE',
        datetime: '2026-09-10T10:00:00.000Z',
        requiredItemIds: [],
        excludedItemIds: [],
      });

      const errors = await validate(dto);

      expect(errors.some((error) => error.property === 'type')).toBe(true);
    });

    it('rejects an invalid datetime', async () => {
      const dto = Object.assign(new CreateOccasionDto(), {
        type: OccasionType.CLIENT_MEETING,
        datetime: 'not-a-date',
        requiredItemIds: [],
        excludedItemIds: [],
      });

      const errors = await validate(dto);

      expect(errors.some((error) => error.property === 'datetime')).toBe(true);
    });

    it('rejects non-array required item ids', async () => {
      const dto = Object.assign(new CreateOccasionDto(), {
        type: OccasionType.CLIENT_MEETING,
        datetime: '2026-09-10T10:00:00.000Z',
        requiredItemIds: 'item-1',
        excludedItemIds: [],
      });

      const errors = await validate(dto);

      expect(errors.some((error) => error.property === 'requiredItemIds')).toBe(true);
    });

    it('rejects non-string item ids', async () => {
      const dto = Object.assign(new CreateOccasionDto(), {
        type: OccasionType.CLIENT_MEETING,
        datetime: '2026-09-10T10:00:00.000Z',
        requiredItemIds: [123],
        excludedItemIds: [],
      });

      const errors = await validate(dto);

      expect(errors.some((error) => error.property === 'requiredItemIds')).toBe(true);
    });
  });

  describe('UpdateOccasionDto', () => {
    it('accepts a valid partial update', async () => {
      const dto = Object.assign(new UpdateOccasionDto(), {
        type: OccasionType.INTERVIEW,
        audience: 'Hiring panel',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('allows optional fields to be omitted', async () => {
      const dto = new UpdateOccasionDto();

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('rejects an invalid datetime', async () => {
      const dto = Object.assign(new UpdateOccasionDto(), {
        datetime: 'invalid-date',
      });

      const errors = await validate(dto);

      expect(errors.some((error) => error.property === 'datetime')).toBe(true);
    });
  });
});

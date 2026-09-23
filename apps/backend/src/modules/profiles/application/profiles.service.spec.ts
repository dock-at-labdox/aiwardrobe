import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, PresentationStyle } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { ProfilesService } from './profiles.service';

describe('ProfilesService', () => {
  let service: ProfilesService;

  const prismaMock = {
    styleProfile: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    bodyProfile: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get a style profile', async () => {
    const profile = {
      userId: 'User-id',
      presentationStyle: PresentationStyle.MIXED,
    };

    prismaMock.styleProfile.findUnique.mockResolvedValue(profile);

    const result = await service.getStyleProfile('User-id');

    expect(result).toEqual(profile);
    expect(prismaMock.styleProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: 'User-id' },
    });
  });

  it('should create a style profile', async () => {
    const data = {
      presentationStyle: PresentationStyle.MIXED,
      industries: ['Technology'],
      formalityDefault: 'Business Casual',
      fitPreferences: {
        fit: 'regular',
      } as Prisma.InputJsonValue,
    };

    const createdProfile = {
      userId: 'User-id',
      ...data,
    };

    prismaMock.styleProfile.create.mockResolvedValue(createdProfile);

    const result = await service.createStyleProfile('User-id', data);

    expect(result).toEqual(createdProfile);
    expect(prismaMock.styleProfile.create).toHaveBeenCalledWith({
      data: {
        userId: 'User-id',
        presentationStyle: data.presentationStyle,
        industries: data.industries,
        formalityDefault: data.formalityDefault,
        fitPreferences: data.fitPreferences,
      },
    });
  });

  it('should update a style profile', async () => {
    const data = {
      presentationStyle: PresentationStyle.FEMININE,
    };

    prismaMock.styleProfile.update.mockResolvedValue(data);

    const result = await service.updateStyleProfile('User-id', data);

    expect(result).toEqual(data);
    expect(prismaMock.styleProfile.update).toHaveBeenCalledWith({
      where: { userId: 'User-id' },
      data,
    });
  });

  it('should get a body profile', async () => {
    const profile = {
      userId: 'User-id',
      heightCm: 170,
      source: 'USER_INPUT',
    };

    prismaMock.bodyProfile.findUnique.mockResolvedValue(profile);

    const result = await service.getBodyProfile('User-id');

    expect(result).toEqual(profile);
    expect(prismaMock.bodyProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: 'User-id' },
    });
  });

  it('should create a body profile', async () => {
    const data = {
      heightCm: 170,
      buildDescriptor: 'Average',
      undertone: 'Neutral',
      source: 'USER_INPUT',
      userConfirmed: true,
    };

    const createdProfile = {
      userId: 'User-id',
      ...data,
    };

    prismaMock.bodyProfile.create.mockResolvedValue(createdProfile);

    const result = await service.createBodyProfile('User-id', data);

    expect(result).toEqual(createdProfile);
    expect(prismaMock.bodyProfile.create).toHaveBeenCalledWith({
      data: {
        userId: 'User-id',
        heightCm: data.heightCm,
        buildDescriptor: data.buildDescriptor,
        undertone: data.undertone,
        source: data.source,
        userConfirmed: data.userConfirmed,
      },
    });
  });

  it('should update a body profile', async () => {
    const data = {
      heightCm: 175,
      buildDescriptor: 'Athletic',
    };

    prismaMock.bodyProfile.update.mockResolvedValue(data);

    const result = await service.updateBodyProfile('User-id', data);

    expect(result).toEqual(data);
    expect(prismaMock.bodyProfile.update).toHaveBeenCalledWith({
      where: { userId: 'User-id' },
      data,
    });
  });
});

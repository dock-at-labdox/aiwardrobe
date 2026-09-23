import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';

import { GetCurrentUserService } from '../../identity-consent/application/get-current-user.service';
import { AuthenticatedIdentity } from '../../identity-consent/domain/identity-provider';
import { AuthGuard } from '../../identity-consent/infrastructure/auth.guard';
import { OccasionsService } from '../application/occasions.service';
import { OccasionsController } from './occasions.controller';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedIdentity;
};

describe('OccasionsController', () => {
  let controller: OccasionsController;

  const occasionsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
  };

  const getCurrentUserServiceMock = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OccasionsController],
      providers: [
        {
          provide: OccasionsService,
          useValue: occasionsServiceMock,
        },
        {
          provide: GetCurrentUserService,
          useValue: getCurrentUserServiceMock,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OccasionsController>(OccasionsController);
  });

  it('should use the authenticated user when finding an occasion', async () => {
    const authenticatedIdentity: AuthenticatedIdentity = {
      providerSubjectId: 'auth0|user-123',
    };

    const authenticatedUser = {
      id: 'user-123',
    };

    const occasionId = 'occasion-123';

    getCurrentUserServiceMock.execute.mockResolvedValue(authenticatedUser);
    occasionsServiceMock.findOne.mockResolvedValue({
      id: occasionId,
      userId: authenticatedUser.id,
    });

    const request = {
      user: authenticatedIdentity,
    } as AuthenticatedRequest;

    await controller.findOne(request, occasionId);

    expect(getCurrentUserServiceMock.execute).toHaveBeenCalledWith(authenticatedIdentity);

    expect(occasionsServiceMock.findOne).toHaveBeenCalledWith(authenticatedUser.id, occasionId);
  });
});

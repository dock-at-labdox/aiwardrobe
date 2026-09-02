import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { GetCurrentUserService } from '../../identity-consent/application/get-current-user.service';
import { AuthenticatedIdentity } from '../../identity-consent/domain/identity-provider';
import { AuthGuard } from '../../identity-consent/infrastructure/auth.guard';
import { CreateWearEventService } from '../application/create-wear-event.service';
import { CreateWearEventDto } from './dto/create-wear-event.dto';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedIdentity;
};

@Controller('wear-events')
@UseGuards(AuthGuard)
export class WearEventsController {
  constructor(
    private readonly createWearEventService: CreateWearEventService,
    private readonly getCurrentUserService: GetCurrentUserService,
  ) {}

  @Post()
  async createWearEvent(@Req() request: AuthenticatedRequest, @Body() dto: CreateWearEventDto) {
    const user = await this.getCurrentUserService.execute(request.user!);

    return this.createWearEventService.execute({
      savedLookId: dto.savedLookId,
      userId: user.id,
      wornAt: new Date(dto.wornAt),
      audienceKey: dto.audienceKey,
      rating: dto.rating,
      notes: dto.notes,
    });
  }
}

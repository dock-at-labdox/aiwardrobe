import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { ConsentService } from '../application/consent.service';
import { GetCurrentUserService } from '../application/get-current-user.service';
import { AuthenticatedIdentity } from '../domain/identity-provider';
import { AuthGuard } from '../infrastructure/auth.guard';
import { UpdateConsentDto } from './dto/update-consent.dto';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedIdentity;
};

@Controller('consents')
@UseGuards(AuthGuard)
export class ConsentController {
  constructor(
    private readonly consentService: ConsentService,
    private readonly getCurrentUserService: GetCurrentUserService,
  ) {}

  @Get()
  async getConsents(@Req() request: AuthenticatedRequest) {
    const user = await this.getCurrentUserService.execute(request.user!);

    return this.consentService.getConsents(user.id);
  }

  @Post()
  async updateConsent(@Req() request: AuthenticatedRequest, @Body() dto: UpdateConsentDto) {
    const user = await this.getCurrentUserService.execute(request.user!);

    return this.consentService.updateConsent(user.id, dto.purpose, dto.status);
  }
}

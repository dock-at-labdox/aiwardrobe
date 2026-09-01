import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { GetCurrentUserService } from '../application/get-current-user.service';
import { AuthenticatedIdentity } from '../domain/identity-provider';
import { AuthGuard } from '../infrastructure/auth.guard';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedIdentity;
};

@Controller('me')
export class MeController {
  constructor(private readonly getCurrentUserService: GetCurrentUserService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getMe(@Req() request: AuthenticatedRequest) {
    return this.getCurrentUserService.execute(request.user!);
  }
}

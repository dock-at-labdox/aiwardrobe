import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { GetCurrentUserService } from '../../identity-consent/application/get-current-user.service';
import { AuthenticatedIdentity } from '../../identity-consent/domain/identity-provider';
import { AuthGuard } from '../../identity-consent/infrastructure/auth.guard';
import { ProfilesService } from '../application/profiles.service';
import { CreateStyleProfileDto } from './dto/create-style-profile.dto';
import { UpdateStyleProfileDto } from './dto/update-style-profile.dto';
import { CreateBodyProfileDto } from './dto/create-body-profile.dto';
import { UpdateBodyProfileDto } from './dto/update-body-profile.dto';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedIdentity;
};

@Controller('profiles')
@UseGuards(AuthGuard)
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly getCurrentUserService: GetCurrentUserService,
  ) {}

  @Get('style')
  async getStyleProfile(@Req() request: AuthenticatedRequest) {
    const user = await this.getCurrentUserService.execute(request.user!);

    return this.profilesService.getStyleProfile(user.id);
  }

  @Post('style')
  async createStyleProfile(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateStyleProfileDto,
  ) {
    const user = await this.getCurrentUserService.execute(request.user!);

    return this.profilesService.createStyleProfile(user.id, dto);
  }

  @Patch('style')
  async updateStyleProfile(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateStyleProfileDto,
  ) {
    const user = await this.getCurrentUserService.execute(request.user!);

    return this.profilesService.updateStyleProfile(user.id, dto);
  }

  @Get('body')
  async getBodyProfile(@Req() request: AuthenticatedRequest) {
    const user = await this.getCurrentUserService.execute(request.user!);

    return this.profilesService.getBodyProfile(user.id);
  }

  @Post('body')
  async createBodyProfile(@Req() request: AuthenticatedRequest, @Body() dto: CreateBodyProfileDto) {
    const user = await this.getCurrentUserService.execute(request.user!);

    return this.profilesService.createBodyProfile(user.id, dto);
  }

  @Patch('body')
  async updateBodyProfile(@Req() request: AuthenticatedRequest, @Body() dto: UpdateBodyProfileDto) {
    const user = await this.getCurrentUserService.execute(request.user!);

    return this.profilesService.updateBodyProfile(user.id, dto);
  }
}

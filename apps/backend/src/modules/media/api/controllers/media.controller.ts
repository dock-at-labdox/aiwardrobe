import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { AuthGuard } from '../../../identity-consent/infrastructure/auth.guard';
import { GetCurrentUserService } from '../../../identity-consent/application/get-current-user.service';
import type { AuthenticatedIdentity } from '../../../identity-consent/domain/identity-provider';
import { RegisterMediaDto } from '../dto/register-media.dto';
import { MediaService } from '../../application/media.service';
import { Prisma } from '@prisma/client';
type AuthenticatedRequest = Request & {
  user: AuthenticatedIdentity;
};

@Controller('v1/media/assets')
@UseGuards(AuthGuard)
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly getCurrentUserService: GetCurrentUserService,
  ) {}

  @Post()
  async register(@Req() request: AuthenticatedRequest, @Body() dto: RegisterMediaDto) {
    const user = await this.getCurrentUserService.execute(request.user);

    return this.mediaService.register(user.id, {
      ...dto,
      deviceMetadata: dto.deviceMetadata as Prisma.InputJsonValue | undefined,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });
  }

  @Get()
  async findAll(@Req() request: AuthenticatedRequest) {
    const user = await this.getCurrentUserService.execute(request.user);

    return this.mediaService.findAll(user.id);
  }

  @Get(':id')
  async findOne(@Req() request: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    const user = await this.getCurrentUserService.execute(request.user);

    return this.mediaService.findOne(user.id, id);
  }

  @Delete(':id')
  async remove(@Req() request: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    const user = await this.getCurrentUserService.execute(request.user);

    return this.mediaService.remove(user.id, id);
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { WardrobeService } from '../../application/wardrobe.service';
import { CreateWardrobeItemDto } from '../dto/create-wardrobe-item.dto';
import { UpdateWardrobeItemDto } from '../dto/update-wardrobe-item.dto';
import { AuthGuard } from '../../../identity-consent/infrastructure/auth.guard';
import { GetCurrentUserService } from '../../../identity-consent/application/get-current-user.service';
import { AuthenticatedIdentity } from '../../../identity-consent/domain/identity-provider';

type AuthenticatedRequest = Request & {
  user: AuthenticatedIdentity;
};

@Controller('v1/wardrobe/items')
@UseGuards(AuthGuard)
export class WardrobeController {
  constructor(
    private readonly wardrobeService: WardrobeService,
    private readonly getCurrentUserService: GetCurrentUserService,
  ) {}

  @Post()
  async create(@Req() request: AuthenticatedRequest, @Body() dto: CreateWardrobeItemDto) {
    const user = await this.getCurrentUserService.execute(request.user);

    return this.wardrobeService.create(user.id, dto);
  }

  @Get()
  async findAll(@Req() request: AuthenticatedRequest) {
    const user = await this.getCurrentUserService.execute(request.user);

    return this.wardrobeService.findAll(user.id);
  }

  @Get(':id')
  async findOne(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    const user = await this.getCurrentUserService.execute(request.user);

    return this.wardrobeService.findOne(user.id, id);
  }

  @Patch(':id')
  async update(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateWardrobeItemDto,
  ) {
    const user = await this.getCurrentUserService.execute(request.user);

    return this.wardrobeService.update(user.id, id, dto);
  }

  @Delete(':id')
  async remove(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    const user = await this.getCurrentUserService.execute(request.user);

    return this.wardrobeService.remove(user.id, id);
  }
}

import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { GetCurrentUserService } from '../../identity-consent/application/get-current-user.service';
import { AuthenticatedIdentity } from '../../identity-consent/domain/identity-provider';
import { AuthGuard } from '../../identity-consent/infrastructure/auth.guard';
import { OccasionsService } from '../application/occasions.service';
import { CreateOccasionDto } from './dto/create-occasion.dto';
import { UpdateOccasionDto } from './dto/update-occasion.dto';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedIdentity;
};

@Controller('occasions')
@UseGuards(AuthGuard)
export class OccasionsController {
  constructor(
    private readonly occasionsService: OccasionsService,
    private readonly getCurrentUserService: GetCurrentUserService,
  ) {}

  @Post()
  async create(@Req() request: AuthenticatedRequest, @Body() dto: CreateOccasionDto) {
    const user = await this.getCurrentUserService.execute(request.user!);

    return this.occasionsService.create(user.id, dto);
  }

  @Get()
  async findAll(@Req() request: AuthenticatedRequest) {
    const user = await this.getCurrentUserService.execute(request.user!);

    return this.occasionsService.findAll(user.id);
  }

  @Get(':id')
  async findOne(@Req() request: AuthenticatedRequest, @Param('id') occasionId: string) {
    const user = await this.getCurrentUserService.execute(request.user!);

    return this.occasionsService.findOne(user.id, occasionId);
  }

  @Patch(':id')
  async update(
    @Req() request: AuthenticatedRequest,
    @Param('id') occasionId: string,
    @Body() dto: UpdateOccasionDto,
  ) {
    const user = await this.getCurrentUserService.execute(request.user!);

    return this.occasionsService.update(user.id, occasionId, dto);
  }

  @Patch(':id/archive')
  async archive(@Req() request: AuthenticatedRequest, @Param('id') occasionId: string) {
    const user = await this.getCurrentUserService.execute(request.user!);

    return this.occasionsService.archive(user.id, occasionId);
  }
}

import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { GetCurrentUserService } from '../../identity-consent/application/get-current-user.service';
import { AuthenticatedIdentity } from '../../identity-consent/domain/identity-provider';
import { AuthGuard } from '../../identity-consent/infrastructure/auth.guard';
import { SaveOutfitService } from '../application/save-outfit.service';
import { SaveOutfitDto } from './dto/save-outfit.dto';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedIdentity;
};

@Controller('outfits')
@UseGuards(AuthGuard)
export class OutfitsController {
  constructor(
    private readonly saveOutfitService: SaveOutfitService,
    private readonly getCurrentUserService: GetCurrentUserService,
  ) {}

  @Post(':id/save')
  async saveOutfit(
    @Req() request: AuthenticatedRequest,
    @Param('id') outfitId: string,
    @Body() dto: SaveOutfitDto,
  ) {
    const user = await this.getCurrentUserService.execute(request.user!);

    return this.saveOutfitService.execute({
      outfitId,
      userId: user.id,
      title: dto.title,
    });
  }
}

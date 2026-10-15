import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedIdentity } from '../../identity-consent/domain/identity-provider';
import { AuthGuard } from '../../identity-consent/infrastructure/auth.guard';
import { CreateRecommendationDto } from './create-recommendation.dto';
import { RecommendationService } from '../application/recommendation.service';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedIdentity;
}

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateRecommendationDto) {
    return this.recommendationService.generate(
      req.user.providerSubjectId,
      dto.occasionId,
      dto.requiredItemIds,
      dto.excludedItemIds,
    );
  }
}

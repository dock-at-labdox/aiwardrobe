import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { IdentityConsentModule } from '../identity-consent/identity-consent.module';
import { RecommendationsController } from './api/recommendations.controller';
import { RecommendationService } from './application/recommendation.service';
import { RECOMMENDATION_ENGINE } from './application/recommendation.token';
import { RuleBasedRecommendationEngine } from './infrastructure/rule-based-recommendation.engine';

@Module({
  imports: [PrismaModule, IdentityConsentModule],
  controllers: [RecommendationsController],
  providers: [
    RecommendationService,
    {
      provide: RECOMMENDATION_ENGINE,
      useClass: RuleBasedRecommendationEngine,
    },
  ],
})
export class RecommendationsModule {}

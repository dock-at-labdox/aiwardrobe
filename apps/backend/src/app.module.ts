import { Module } from '@nestjs/common';
import { ConfigModule } from './common/config/config.module';
import { LoggingModule } from './common/logging/logging.module';
import { HealthModule } from './health/health.module';
import { PlaceholderModulesModule } from './modules/placeholder-modules.module';
import { PrismaModule } from './prisma/prisma.module';
import { IdentityConsentModule } from './modules/identity-consent/identity-consent.module';
import { WardrobeModule } from './modules/wardrobe/wardrobe.module';
import { OutfitsPlannerModule } from './modules/outfits-planner/outfits-planner.module';

@Module({
  imports: [
    ConfigModule,
    LoggingModule,
    PrismaModule,
    HealthModule,
    PlaceholderModulesModule,
    IdentityConsentModule,
    WardrobeModule,
    OutfitsPlannerModule,
  ],
})
export class AppModule {}

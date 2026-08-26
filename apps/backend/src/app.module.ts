import { Module } from '@nestjs/common';
import { ConfigModule } from './common/config/config.module';
import { LoggingModule } from './common/logging/logging.module';
import { HealthModule } from './health/health.module';
import { PlaceholderModulesModule } from './modules/placeholder-modules.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfilesModule } from './modules/profiles/profiles.module';

@Module({
  imports: [
    ConfigModule,
    LoggingModule,
    PrismaModule,
    HealthModule,
    PlaceholderModulesModule,
    ProfilesModule,
  ],
})
export class AppModule {}

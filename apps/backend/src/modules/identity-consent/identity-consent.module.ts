import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { GetCurrentUserService } from './application/get-current-user.service';
import { ConfigModule } from '@nestjs/config';
import { Auth0IdentityProvider } from './infrastructure/auth0-identity-provider';
import { AuthGuard } from './infrastructure/auth.guard';
import { IDENTITY_PROVIDER } from './domain/identity-provider.token';
import { MeController } from './api/me.controller';
import { ConsentService } from './application/consent.service';
import { ConsentController } from './api/consent.controller';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [MeController, ConsentController],
  providers: [
    {
      provide: IDENTITY_PROVIDER,
      useClass: Auth0IdentityProvider,
    },
    AuthGuard,
    GetCurrentUserService,
    ConsentService,
  ],
  exports: [IDENTITY_PROVIDER, AuthGuard],
})
export class IdentityConsentModule {}

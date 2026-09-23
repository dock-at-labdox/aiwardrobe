import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { IdentityConsentModule } from '../identity-consent/identity-consent.module';
import { BillingController } from './api/billing.controller';
import { BillingService } from './application/billing.service';

@Module({
  imports: [PrismaModule, IdentityConsentModule],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}

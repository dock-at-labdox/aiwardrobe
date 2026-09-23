import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FeedbackController } from './api/feedback.controller';
import { FeedbackService } from './application/feedback.service';
import { IdentityConsentModule } from '../identity-consent/identity-consent.module';

@Module({
  imports: [PrismaModule, IdentityConsentModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}

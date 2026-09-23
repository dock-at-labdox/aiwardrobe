import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedIdentity } from '../../identity-consent/domain/identity-provider';
import { AuthGuard } from '../../identity-consent/infrastructure/auth.guard';
import { BillingService } from '../application/billing.service';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedIdentity;
}

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @UseGuards(AuthGuard)
  @Get('entitlement')
  getEntitlement(@Req() req: AuthenticatedRequest) {
    return this.billingService.getEntitlement(req.user.providerSubjectId);
  }
}

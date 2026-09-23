import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async getEntitlement(providerSubjectId: string) {
    const authIdentity = await this.prisma.authIdentity.findFirst({
      where: { providerSubjectId },
    });

    if (!authIdentity) {
      throw new NotFoundException('User not found for authenticated identity');
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { userId: authIdentity.userId },
    });

    if (!subscription) {
      throw new NotFoundException('No subscription found for this user');
    }

    // Quota balance = sum of all ledger entries for the try-on resource.
    const ledgerEntries = await this.prisma.quotaLedgerEntry.findMany({
      where: { userId: authIdentity.userId, resourceType: 'tryon_generation' },
    });
    const quotaRemaining = ledgerEntries.reduce((sum, entry) => sum + entry.delta, 0);

    return {
      plan: subscription.plan,
      billingStatus: subscription.billingStatus,
      quotaRemaining,
    };
  }
}

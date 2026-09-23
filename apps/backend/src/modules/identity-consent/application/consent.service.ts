import { Injectable } from '@nestjs/common';
import { ConsentPurpose, ConsentStatus } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ConsentService {
  constructor(private readonly prisma: PrismaService) {}

  async getConsents(userId: string) {
    return this.prisma.consent.findMany({
      where: {
        userId,
      },
      orderBy: [{ purpose: 'asc' }, { version: 'desc' }],
    });
  }

  async updateConsent(userId: string, purpose: ConsentPurpose, status: ConsentStatus) {
    const latestConsent = await this.prisma.consent.findFirst({
      where: {
        userId,
        purpose,
      },
      orderBy: {
        version: 'desc',
      },
    });

    const nextVersion = latestConsent ? latestConsent.version + 1 : 1;

    return this.prisma.consent.create({
      data: {
        userId,
        purpose,
        status,
        version: nextVersion,
      },
    });
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthProvider } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { AuthenticatedIdentity } from '../domain/identity-provider';

@Injectable()
export class GetCurrentUserService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(identity: AuthenticatedIdentity) {
    const authIdentity = await this.prisma.authIdentity.findUnique({
      where: {
        provider_providerSubjectId: {
          provider: AuthProvider.OIDC,
          providerSubjectId: identity.providerSubjectId,
        },
      },
      include: {
        user: true,
      },
    });

    if (!authIdentity) {
      throw new UnauthorizedException('User identity not found');
    }

    return authIdentity.user;
  }
}

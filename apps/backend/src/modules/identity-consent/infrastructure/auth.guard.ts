import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Inject } from '@nestjs/common';

import { AuthenticatedIdentity, IdentityProvider } from '../domain/identity-provider';
import { IDENTITY_PROVIDER } from '../domain/identity-provider.token';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedIdentity;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(IDENTITY_PROVIDER)
    private readonly identityProvider: IdentityProvider,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authentication token');
    }

    const token = authorization.substring('Bearer '.length);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    const identity = await this.identityProvider.verifyToken(token);

    request.user = identity;

    return true;
  }
}

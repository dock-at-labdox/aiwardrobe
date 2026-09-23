import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';

import { AuthenticatedIdentity, IdentityProvider } from '../domain/identity-provider';

@Injectable()
export class Auth0IdentityProvider implements IdentityProvider {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;
  private readonly issuer: string;
  private readonly audience: string;

  constructor(private readonly configService: ConfigService) {
    const domain = this.configService.getOrThrow<string>('AUTH0_DOMAIN');
    this.audience = this.configService.getOrThrow<string>('AUTH0_AUDIENCE');

    this.issuer = `https://${domain}/`;

    this.jwks = createRemoteJWKSet(new URL(`${this.issuer}.well-known/jwks.json`));
  }

  async verifyToken(token: string): Promise<AuthenticatedIdentity> {
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        audience: this.audience,
      });

      if (typeof payload.sub !== 'string') {
        throw new UnauthorizedException('Token does not contain a subject');
      }

      return {
        providerSubjectId: payload.sub,
        email: typeof payload.email === 'string' ? payload.email : undefined,
      };
    } catch {
      throw new UnauthorizedException('Invalid authentication token');
    }
  }
}

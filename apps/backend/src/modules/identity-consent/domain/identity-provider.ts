export interface IdentityProvider {
  verifyToken(token: string): Promise<AuthenticatedIdentity>;
}

export interface AuthenticatedIdentity {
  providerSubjectId: string;
  email?: string;
}

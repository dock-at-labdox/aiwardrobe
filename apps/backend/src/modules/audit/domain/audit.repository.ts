import { AuditEvent, Prisma } from '@prisma/client';

export const AUDIT_REPOSITORY = Symbol('AUDIT_REPOSITORY');

export interface AuditRepository {
  record(params: {
    actorUserId?: string | null;
    action: string;
    objectType: string;
    objectId: string;
    correlationId: string;
    metadata?: Prisma.InputJsonValue;
  }): Promise<AuditEvent>;
}

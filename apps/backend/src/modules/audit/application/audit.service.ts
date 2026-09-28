import { Inject, Injectable } from '@nestjs/common';
import { AUDIT_REPOSITORY, AuditRepository } from '../domain/audit.repository';

@Injectable()
export class AuditService {
  constructor(
    @Inject(AUDIT_REPOSITORY)
    private readonly auditRepository: AuditRepository,
  ) {}

  async record(params: {
    actorUserId?: string | null;
    action: string;
    objectType: string;
    objectId: string;
    correlationId: string;
    metadata?: import('@prisma/client').Prisma.InputJsonValue;
  }) {
    return this.auditRepository.record(params);
  }
}

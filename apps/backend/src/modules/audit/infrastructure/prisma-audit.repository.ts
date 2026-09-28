import { Injectable } from '@nestjs/common';
import { AuditEvent, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditRepository } from '../domain/audit.repository';

@Injectable()
export class PrismaAuditRepository implements AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async record(params: {
    actorUserId?: string | null;
    action: string;
    objectType: string;
    objectId: string;
    correlationId: string;
    metadata?: Prisma.InputJsonValue;
  }): Promise<AuditEvent> {
    return this.prisma.auditEvent.create({
      data: {
        actorUserId: params.actorUserId ?? null,
        action: params.action,
        objectType: params.objectType,
        objectId: params.objectId,
        correlationId: params.correlationId,
        metadata: params.metadata,
      },
    });
  }
}

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditService } from './application/audit.service';
import { AUDIT_REPOSITORY } from './domain/audit.repository';
import { PrismaAuditRepository } from './infrastructure/prisma-audit.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    AuditService,
    PrismaAuditRepository,
    {
      provide: AUDIT_REPOSITORY,
      useExisting: PrismaAuditRepository,
    },
  ],
  exports: [AuditService],
})
export class AuditModule {}

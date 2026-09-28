import { PrismaAuditRepository } from './prisma-audit.repository';
import { PrismaService } from '../../../prisma/prisma.service';

describe('PrismaAuditRepository', () => {
  let repository: PrismaAuditRepository;

  const prisma = {
    auditEvent: {
      create: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    repository = new PrismaAuditRepository(prisma as unknown as PrismaService);
  });

  describe('record', () => {
    it('creates an audit event without exposing update or delete operations', async () => {
      const auditEvent = {
        id: 'audit-1',
        actorUserId: 'user-1',
        action: 'CREATE',
        objectType: 'OCCASION',
        objectId: 'occasion-1',
        correlationId: 'correlation-1',
        metadata: { source: 'test' },
        createdAt: new Date(),
      };

      prisma.auditEvent.create.mockResolvedValue(auditEvent);

      const result = await repository.record({
        actorUserId: 'user-1',
        action: 'CREATE',
        objectType: 'OCCASION',
        objectId: 'occasion-1',
        correlationId: 'correlation-1',
        metadata: { source: 'test' },
      });

      expect(prisma.auditEvent.create).toHaveBeenCalledWith({
        data: {
          actorUserId: 'user-1',
          action: 'CREATE',
          objectType: 'OCCASION',
          objectId: 'occasion-1',
          correlationId: 'correlation-1',
          metadata: { source: 'test' },
        },
      });

      expect(result).toEqual(auditEvent);
    });
  });
});

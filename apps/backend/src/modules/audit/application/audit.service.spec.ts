import { AuditService } from './audit.service';
import { AUDIT_REPOSITORY, AuditRepository } from '../domain/audit.repository';

describe('AuditService', () => {
  let service: AuditService;

  const repository = {
    record: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new AuditService(repository as unknown as AuditRepository);
  });

  describe('record', () => {
    it('records an audit event through the repository', async () => {
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

      repository.record.mockResolvedValue(auditEvent);

      const result = await service.record({
        actorUserId: 'user-1',
        action: 'CREATE',
        objectType: 'OCCASION',
        objectId: 'occasion-1',
        correlationId: 'correlation-1',
        metadata: { source: 'test' },
      });

      expect(repository.record).toHaveBeenCalledWith({
        actorUserId: 'user-1',
        action: 'CREATE',
        objectType: 'OCCASION',
        objectId: 'occasion-1',
        correlationId: 'correlation-1',
        metadata: { source: 'test' },
      });

      expect(result).toEqual(auditEvent);
    });
  });
});

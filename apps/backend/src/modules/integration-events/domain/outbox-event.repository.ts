import { Prisma } from '@prisma/client';

export interface CreateOutboxEventInput {
  eventType: string;
  payload: Prisma.InputJsonValue;
  schemaVersion: string;
  correlationId: string;
}

export interface OutboxEventRepository {
  create(input: CreateOutboxEventInput): Promise<void>;
}

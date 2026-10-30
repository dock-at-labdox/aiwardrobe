import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateOutboxEventInput, OutboxEventRepository } from '../domain/outbox-event.repository';

@Injectable()
export class PrismaOutboxEventRepository implements OutboxEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateOutboxEventInput): Promise<void> {
    await this.prisma.outboxEvent.create({
      data: {
        eventType: input.eventType,
        payload: input.payload,
        schemaVersion: input.schemaVersion,
        correlationId: input.correlationId,
        // publishedAt stays null — means "not yet dispatched"
      },
    });
  }
}

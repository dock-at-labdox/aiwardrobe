import { Inject, Injectable } from '@nestjs/common';
import { CreateOutboxEventInput, OutboxEventRepository } from '../domain/outbox-event.repository';
import { OUTBOX_EVENT_REPOSITORY } from './outbox-event.token';

@Injectable()
export class OutboxEventService {
  constructor(
    @Inject(OUTBOX_EVENT_REPOSITORY)
    private readonly repository: OutboxEventRepository,
  ) {}

  async record(input: CreateOutboxEventInput): Promise<void> {
    return this.repository.create(input);
  }
}

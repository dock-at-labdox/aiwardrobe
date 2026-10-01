import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { OutboxEventService } from './application/outbox-event.service';
import { OUTBOX_EVENT_REPOSITORY } from './application/outbox-event.token';
import { PrismaOutboxEventRepository } from './infrastructure/prisma-outbox-event.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    OutboxEventService,
    {
      provide: OUTBOX_EVENT_REPOSITORY,
      useClass: PrismaOutboxEventRepository,
    },
  ],
  exports: [OutboxEventService],
})
export class IntegrationEventsModule {}

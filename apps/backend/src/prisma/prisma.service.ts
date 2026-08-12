import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/** Central Prisma lifecycle boundary; repositories are added by domain modules. */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  // Connections are opened by the first repository operation. This keeps /health dependency-free.
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

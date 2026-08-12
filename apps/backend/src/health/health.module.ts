import { Controller, Get, Module } from '@nestjs/common';

@Controller('health')
class HealthController {
  @Get()
  getHealth(): { status: 'ok'; service: string } {
    return { status: 'ok', service: 'api' };
  }
}

@Module({ controllers: [HealthController] })
export class HealthModule {}

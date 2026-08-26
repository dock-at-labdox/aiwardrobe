import { Module } from '@nestjs/common';
import { ProfilesController } from './api/profiles.controller';
import { ProfilesService } from './application/profiles.service';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}

import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ProfilesService } from '../application/profiles.service';
import { CreateStyleProfileDto } from './dto/create-style-profile.dto';
import { UpdateStyleProfileDto } from './dto/update-style-profile.dto';
import { CreateBodyProfileDto } from './dto/create-body-profile.dto';
import { UpdateBodyProfileDto } from './dto/update-body-profile.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':userId/style')
  getStyleProfile(@Param('userId') userId: string) {
    return this.profilesService.getStyleProfile(userId);
  }

  @Post(':userId/style')
  createStyleProfile(@Param('userId') userId: string, @Body() dto: CreateStyleProfileDto) {
    return this.profilesService.createStyleProfile(userId, dto);
  }

  @Patch(':userId/style')
  updateStyleProfile(@Param('userId') userId: string, @Body() dto: UpdateStyleProfileDto) {
    return this.profilesService.updateStyleProfile(userId, dto);
  }

  @Get(':userId/body')
  getBodyProfile(@Param('userId') userId: string) {
    return this.profilesService.getBodyProfile(userId);
  }

  @Post(':userId/body')
  createBodyProfile(@Param('userId') userId: string, @Body() dto: CreateBodyProfileDto) {
    return this.profilesService.createBodyProfile(userId, dto);
  }

  @Patch(':userId/body')
  updateBodyProfile(@Param('userId') userId: string, @Body() dto: UpdateBodyProfileDto) {
    return this.profilesService.updateBodyProfile(userId, dto);
  }
}

import { PartialType } from '@nestjs/mapped-types';
import { CreateStyleProfileDto } from './create-style-profile.dto';

export class UpdateStyleProfileDto extends PartialType(CreateStyleProfileDto) {}

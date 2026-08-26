import { PartialType } from '@nestjs/mapped-types';
import { CreateBodyProfileDto } from './create-body-profile.dto';

export class UpdateBodyProfileDto extends PartialType(CreateBodyProfileDto) {}

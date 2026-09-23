import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedIdentity } from '../../identity-consent/domain/identity-provider';
import { AuthGuard } from '../../identity-consent/infrastructure/auth.guard';
import { CreateFeedbackDto } from './create-feedback.dto';
import { FeedbackService } from '../application/feedback.service';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedIdentity;
}

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateFeedbackDto) {
    return this.feedbackService.create(req.user.providerSubjectId, dto);
  }
}

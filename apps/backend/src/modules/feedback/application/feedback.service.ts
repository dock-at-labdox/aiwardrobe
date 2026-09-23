import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateFeedbackDto } from '../api/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(providerSubjectId: string, dto: CreateFeedbackDto) {
    const authIdentity = await this.prisma.authIdentity.findFirst({
      where: { providerSubjectId },
    });

    if (!authIdentity) {
      throw new Error('User not found for authenticated identity');
    }

    return this.prisma.feedback.create({
      data: {
        userId: authIdentity.userId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        reason: dto.reason,
      },
    });
  }
}

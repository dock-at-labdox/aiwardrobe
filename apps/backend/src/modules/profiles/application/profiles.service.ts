import { Injectable } from '@nestjs/common';
import { Prisma, PresentationStyle } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getStyleProfile(userId: string) {
    return this.prisma.styleProfile.findUnique({
      where: { userId },
    });
  }

  async createStyleProfile(
    userId: string,
    data: {
      presentationStyle: PresentationStyle;
      industries: string[];
      formalityDefault?: string;
      fitPreferences?: Prisma.InputJsonValue;
    },
  ) {
    return this.prisma.styleProfile.create({
      data: {
        userId,
        presentationStyle: data.presentationStyle,
        industries: data.industries,
        formalityDefault: data.formalityDefault,
        fitPreferences: data.fitPreferences,
      },
    });
  }

  async updateStyleProfile(
    userId: string,
    data: {
      presentationStyle?: PresentationStyle;
      industries?: string[];
      formalityDefault?: string;
      fitPreferences?: Prisma.InputJsonValue;
    },
  ) {
    return this.prisma.styleProfile.update({
      where: { userId },
      data,
    });
  }

  async getBodyProfile(userId: string) {
    return this.prisma.bodyProfile.findUnique({
      where: { userId },
    });
  }

  async createBodyProfile(
    userId: string,
    data: {
      heightCm?: number;
      buildDescriptor?: string;
      undertone?: string;
      source: string;
      userConfirmed?: boolean;
    },
  ) {
    return this.prisma.bodyProfile.create({
      data: {
        userId,
        heightCm: data.heightCm,
        buildDescriptor: data.buildDescriptor,
        undertone: data.undertone,
        source: data.source,
        userConfirmed: data.userConfirmed,
      },
    });
  }

  async updateBodyProfile(
    userId: string,
    data: {
      heightCm?: number;
      buildDescriptor?: string;
      undertone?: string;
      source?: string;
      userConfirmed?: boolean;
    },
  ) {
    return this.prisma.bodyProfile.update({
      where: { userId },
      data,
    });
  }
}

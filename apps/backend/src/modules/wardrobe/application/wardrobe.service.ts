import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateWardrobeItemDto } from '../api/dto/create-wardrobe-item.dto';
import { UpdateWardrobeItemDto } from '../api/dto/update-wardrobe-item.dto';
@Injectable()
export class WardrobeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateWardrobeItemDto) {
    return this.prisma.wardrobeItem.create({
      data: {
        userId,
        category: dto.category,
        subtype: dto.subtype,
        name: dto.name,
        attributes: dto.attributes as Prisma.InputJsonValue,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.wardrobeItem.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(userId: string, id: string) {
    return this.prisma.wardrobeItem.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });
  }
  async update(userId: string, id: string, dto: UpdateWardrobeItemDto) {
    const item = await this.prisma.wardrobeItem.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!item) {
      return null;
    }

    return this.prisma.wardrobeItem.update({
      where: {
        id: item.id,
      },
      data: {
        category: dto.category,
        subtype: dto.subtype,
        name: dto.name,
        attributes: dto.attributes as Prisma.InputJsonValue,
      },
    });
  }

  async remove(userId: string, id: string) {
    const item = await this.prisma.wardrobeItem.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!item) {
      return null;
    }

    return this.prisma.wardrobeItem.update({
      where: {
        id: item.id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

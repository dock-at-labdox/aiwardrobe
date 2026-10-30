import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RecommendationEngine } from '../domain/recommendation-engine';
import { RECOMMENDATION_ENGINE } from './recommendation.token';

@Injectable()
export class RecommendationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(RECOMMENDATION_ENGINE)
    private readonly engine: RecommendationEngine,
  ) {}

  async generate(
    providerSubjectId: string,
    occasionId: string,
    requiredItemIds: string[] = [],
    excludedItemIds: string[] = [],
  ) {
    const authIdentity = await this.prisma.authIdentity.findFirst({
      where: { providerSubjectId },
    });
    if (!authIdentity) {
      throw new NotFoundException('User not found for authenticated identity');
    }

    const occasion = await this.prisma.occasion.findUnique({ where: { id: occasionId } });
    if (!occasion || occasion.userId !== authIdentity.userId) {
      throw new NotFoundException('Occasion not found');
    }

    const items = await this.prisma.wardrobeItem.findMany({
      where: { userId: authIdentity.userId, deletedAt: null },
      select: { id: true, category: true, attributes: true },
    });

    if (items.length < 2) {
      throw new BadRequestException('Not enough wardrobe items to generate recommendations');
    }

    const candidates = this.engine.generateCandidates(items, requiredItemIds, excludedItemIds);

    // Outfits are immutable once created — each candidate becomes its own row,
    // with its items snapshotted into OutfitItem so we can always reconstruct
    // exactly what the user saw, even if the wardrobe item changes later.
    const outfits = await Promise.all(
      candidates.map((candidate) =>
        this.prisma.outfit.create({
          data: {
            occasionId,
            userId: authIdentity.userId,
            strategyLabel: candidate.strategyLabel,
            overallScore: candidate.overallScore,
            rulesetVersion: 'rule-based-v1',
            modelVersion: 'none',
            colorEngineVersion: 'none',
            outfitItems: {
              create: candidate.itemIds.map((itemId, index) => ({
                wardrobeItemId: itemId,
                itemVersionSnapshot: { itemId },
                slot: `slot-${index}`,
                sortOrder: index,
              })),
            },
          },
          include: { outfitItems: true },
        }),
      ),
    );

    return outfits;
  }
}

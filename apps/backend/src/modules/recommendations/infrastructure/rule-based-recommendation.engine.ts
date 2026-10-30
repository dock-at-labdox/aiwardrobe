import { Injectable } from '@nestjs/common';
import {
  OutfitCandidate,
  RecommendationEngine,
  WardrobeItemForRecommendation,
} from '../domain/recommendation-engine';

@Injectable()
export class RuleBasedRecommendationEngine implements RecommendationEngine {
  generateCandidates(
    items: WardrobeItemForRecommendation[],
    requiredItemIds: string[],
    excludedItemIds: string[],
  ): OutfitCandidate[] {
    const eligible = items.filter((item) => !excludedItemIds.includes(item.id));
    const required = eligible.filter((item) => requiredItemIds.includes(item.id));
    const others = eligible.filter((item) => !requiredItemIds.includes(item.id));

    // Placeholder logic: pick a small, varied slice of eligible items per
    // strategy. This exists so the module works end-to-end today — it gets
    // swapped for the real AI service call once the contract with AI is agreed.
    const buildOutfit = (count: number): string[] => [
      ...required.map((item) => item.id),
      ...others.slice(0, count).map((item) => item.id),
    ];

    return [
      { strategyLabel: 'SAFE', overallScore: 0.7, itemIds: buildOutfit(2) },
      { strategyLabel: 'BALANCED', overallScore: 0.75, itemIds: buildOutfit(3) },
      { strategyLabel: 'DISTINCTIVE', overallScore: 0.65, itemIds: buildOutfit(4) },
    ];
  }
}

export interface WardrobeItemForRecommendation {
  id: string;
  category: string;
  attributes: unknown;
}

export interface OutfitCandidate {
  strategyLabel: 'SAFE' | 'BALANCED' | 'DISTINCTIVE';
  overallScore: number;
  itemIds: string[];
}

export interface RecommendationEngine {
  generateCandidates(
    items: WardrobeItemForRecommendation[],
    requiredItemIds: string[],
    excludedItemIds: string[],
  ): OutfitCandidate[];
}

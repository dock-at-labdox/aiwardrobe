export interface RecommendationItem {
  id: string;
  name: string;
  imageUrl: string;
}

export interface RecommendationLook {
  id: string;
  label: 'Safe' | 'Balanced' | 'Distinctive';
  overallScore: number;
  items: RecommendationItem[];
  scores: {
    color: number;
    occasion: number;
    compatibility: number;
  };
  explanation: string;
}

export interface RecommendationResult {
  id: string;
  status: 'complete';
  looks: RecommendationLook[];
}

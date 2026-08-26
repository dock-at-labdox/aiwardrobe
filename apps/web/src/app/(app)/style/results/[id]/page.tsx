import RecommendationResults from '@/features/recommendations/RecommendationResults';

export default async function RecommendationResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <RecommendationResults resultId={id} />;
}

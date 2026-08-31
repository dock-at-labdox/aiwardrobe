import TryOn from '@/features/tryon/TryOn';

type TryOnPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TryOnPage({ params }: TryOnPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">Try-On</h1>
      <TryOn itemId={id} />
    </div>
  );
}

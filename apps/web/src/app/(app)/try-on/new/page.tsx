import TryOn from '@/features/tryon/TryOn';

export default function TryOnNewPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">Try-On</h1>

      <TryOn itemId="new" />
    </div>
  );
}

'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { ErrorEnvelope } from '@aiwardrobe/shared-web';
import { ApiClient, AsyncState } from '@aiwardrobe/shared-web';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const OCCASIONS = [
  { id: 'client-meeting', label: 'Client meeting' },
  { id: 'board-meeting', label: 'Board meeting' },
  { id: 'interview', label: 'Interview' },
  { id: 'presentation', label: 'Presentation' },
  { id: 'networking', label: 'Networking' },
  { id: 'business-dinner', label: 'Business dinner' },
  { id: 'conference', label: 'Conference' },
  { id: 'office-day', label: 'Office day' },
  { id: 'custom', label: 'Custom' },
] as const;

type OccasionId = (typeof OCCASIONS)[number]['id'];

type WardrobeItem = {
  id: string;
  name: string;
  category: string;
  color: string;
  imageUrl: string;
};

type RecommendationRequest = {
  occasion: OccasionId;
  desiredImpression: string;
  pinnedItemIds: string[];
  excludedItemIds: string[];
};

export default function OccasionCreation() {
  const router = useRouter();

  const [occasion, setOccasion] = useState<OccasionId>('office-day');
  const [desiredImpression, setDesiredImpression] = useState('');
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [pinnedItemIds, setPinnedItemIds] = useState<string[]>([]);
  const [excludedItemIds, setExcludedItemIds] = useState<string[]>([]);

  const [loadingItems, setLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState<ErrorEnvelope | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<ErrorEnvelope | null>(null);

  useEffect(() => {
    const apiClient = new ApiClient();

    apiClient
      .get<{ items: WardrobeItem[] }>('/v1/wardrobe/items')
      .then((response) => {
        setItems(response.items);
        setItemsError(null);
      })
      .catch((err) => {
        setItemsError(err as ErrorEnvelope);
      })
      .finally(() => {
        setLoadingItems(false);
      });
  }, []);

  function togglePinned(itemId: string) {
    setPinnedItemIds((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId],
    );

    setExcludedItemIds((current) => current.filter((id) => id !== itemId));
  }

  function toggleExcluded(itemId: string) {
    setExcludedItemIds((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId],
    );

    setPinnedItemIds((current) => current.filter((id) => id !== itemId));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);

    const request: RecommendationRequest = {
      occasion,
      desiredImpression: desiredImpression.trim(),
      pinnedItemIds,
      excludedItemIds,
    };

    try {
      const apiClient = new ApiClient();

      const response = await apiClient.post<{ id: string }>('/v1/recommendations', request, {
        idempotencyKey: crypto.randomUUID(),
      });

      router.push(`/style/results/${response.id}`);
    } catch (err) {
      setSubmitError(err as ErrorEnvelope);
      setSubmitting(false);
    }
  }

  // Some failures need their own message rather than a generic one.
  function getSubmitMessage(error: ErrorEnvelope) {
    if (error.error?.code === 'INSUFFICIENT_WARDROBE') {
      return 'You need a few more items in your wardrobe before we can suggest looks for this occasion.';
    }

    return error.error?.message ?? 'Could not create recommendations. Please try again.';
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold">What are you dressing for?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose an occasion and tell us the impression you want to make. We&apos;ll use it to
          suggest suitable looks.
        </p>
      </header>

      <section>
        <h2 className="text-sm font-semibold">Occasion</h2>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {OCCASIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setOccasion(option.id)}
              className={`rounded-lg border p-4 text-left text-sm transition-colors ${
                occasion === option.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
              }`}
              aria-pressed={occasion === option.id}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <label htmlFor="desired-impression" className="text-sm font-semibold">
          Desired impression
        </label>

        <Textarea
          id="desired-impression"
          value={desiredImpression}
          onChange={(event) => setDesiredImpression(event.target.value)}
          placeholder="e.g. confident, approachable and professional"
          className="mt-3"
        />
      </section>

      <section>
        <div>
          <h2 className="text-sm font-semibold">Pin or exclude items</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Optional. Pin items you want included or exclude items you do not want to wear.
          </p>
        </div>

        <div className="mt-4">
          <AsyncState
            loading={loadingItems}
            error={itemsError}
            empty={!loadingItems && items.length === 0}
            loadingMessage="Loading your wardrobe..."
            emptyMessage="No wardrobe items available yet."
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {items.map((item) => {
                const pinned = pinnedItemIds.includes(item.id);
                const excluded = excludedItemIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={`overflow-hidden rounded-lg border ${
                      pinned ? 'border-primary' : excluded ? 'border-destructive' : ''
                    }`}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={300}
                      height={300}
                      className="aspect-square w-full object-cover"
                    />

                    <div className="space-y-2 p-2">
                      <p className="truncate text-sm font-medium">{item.name}</p>

                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant={pinned ? 'default' : 'outline'}
                          className="flex-1 text-xs"
                          onClick={() => togglePinned(item.id)}
                        >
                          {pinned ? 'Pinned' : 'Pin'}
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant={excluded ? 'destructive' : 'outline'}
                          className="flex-1 text-xs"
                          onClick={() => toggleExcluded(item.id)}
                        >
                          {excluded ? 'Excluded' : 'Exclude'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </AsyncState>
        </div>
      </section>

      <section>
        {submitError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {getSubmitMessage(submitError)}
          </div>
        )}

        <Button type="button" className="w-full" disabled={submitting} onClick={handleSubmit}>
          {submitting ? 'Creating recommendations...' : 'Create recommendations'}
        </Button>
      </section>
    </div>
  );
}

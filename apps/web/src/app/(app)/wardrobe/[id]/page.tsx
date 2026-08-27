'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { ErrorEnvelope } from '@aiwardrobe/shared-web';
import { ApiClient, AsyncState } from '@aiwardrobe/shared-web';

import { Button } from '@/components/ui/button';

import type { WardrobeItem } from '../../../../features/wardrobe/mock-data';

export default function WardrobeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<WardrobeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorEnvelope | null>(null);
  const [confirmedColor, setConfirmedColor] = useState<string | null>(null);
  const [correctingColor, setCorrectingColor] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    const apiClient = new ApiClient();

    apiClient
      .get<WardrobeItem>(`/v1/wardrobe/items/${params.id}`)
      .then((foundItem) => {
        setItem(foundItem);
        setSelectedColor(foundItem.color);
        setError(null);
      })
      .catch((err) => {
        setError(err as ErrorEnvelope);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id]);

  function handleConfirmColor() {
    if (!item) {
      return;
    }

    setConfirmedColor(selectedColor);
    setCorrectingColor(false);
  }

  function handleCorrectColor() {
    setCorrectingColor(true);
    setConfirmedColor(null);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && !item}
        loadingMessage="Loading wardrobe item..."
        emptyMessage="This wardrobe item could not be found."
      >
        {item && (
          <section className="space-y-6">
            <div className="overflow-hidden rounded-xl border bg-white">
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={600}
                height={600}
                className="aspect-square w-full object-cover"
              />

              <div className="space-y-4 p-5">
                <div>
                  <h1 className="text-2xl font-bold">{item.name}</h1>
                  <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-500">Proposed colour</p>

                  <p className="mt-1 text-xl font-semibold">{item.color}</p>

                  {confirmedColor && (
                    <div className="mt-2">
                      <p className="text-sm text-green-700">Confirmed colour: {confirmedColor}</p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push('/wardrobe/new')}
                        >
                          Add another item
                        </Button>

                        <Button type="button" onClick={() => router.push('/wardrobe')}>
                          Back to wardrobe
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {!confirmedColor && !correctingColor && (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="button" onClick={handleConfirmColor} className="flex-1">
                      Confirm colour
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCorrectColor}
                      className="flex-1"
                    >
                      Correct colour
                    </Button>
                  </div>
                )}

                {correctingColor && (
                  <div className="space-y-3 rounded-lg border p-4">
                    <label htmlFor="corrected-color" className="block text-sm font-medium">
                      Enter the correct colour
                    </label>

                    <input
                      id="corrected-color"
                      value={selectedColor}
                      onChange={(event) => setSelectedColor(event.target.value)}
                      className="w-full rounded-md border px-3 py-2"
                      placeholder="e.g. Navy blue"
                    />

                    <Button type="button" onClick={handleConfirmColor} className="w-full">
                      Confirm corrected colour
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </AsyncState>
    </div>
  );
}

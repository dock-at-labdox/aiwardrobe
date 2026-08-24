'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { ApiClient, type ErrorEnvelope } from '@aiwardrobe/shared-web';

import { Button } from '@/components/ui/button';
import { AsyncState } from '@aiwardrobe/shared-web';
import type { WardrobeItem } from './mock-data';

export default function WardrobeList() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorEnvelope | null>(null);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const apiClient = new ApiClient();

    apiClient
      .get<{ items: WardrobeItem[] }>('/v1/wardrobe/items')
      .then((response) => {
        setItems(response.items);
        setError(null);
      })
      .catch((err) => {
        setError(err as ErrorEnvelope);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const categories = useMemo(
    () => ['All', ...new Set(items.map((item) => item.category))],
    [items],
  );

  const filteredItems = useMemo(() => {
    if (category === 'All') {
      return items;
    }

    return items.filter((item) => item.category === category);
  }, [items, category]);

  const parentRef = useRef<HTMLDivElement>(null);

  const rowCount = Math.ceil(filteredItems.length / 2);

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 220,
    overscan: 4,
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Wardrobe</h1>
        <p className="mt-2 text-gray-600">Browse and manage your wardrobe items.</p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto">
        {categories.map((itemCategory) => (
          <Button
            key={itemCategory}
            type="button"
            variant={category === itemCategory ? 'default' : 'outline'}
            onClick={() => setCategory(itemCategory)}
          >
            {itemCategory}
          </Button>
        ))}
      </div>

      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && filteredItems.length === 0}
        loadingMessage="Loading your wardrobe..."
        emptyMessage="Add your first item to start building your wardrobe."
      >
        <div ref={parentRef} className="h-[70vh] overflow-auto">
          <div
            className="relative w-full"
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const startIndex = virtualRow.index * 2;
              const rowItems = filteredItems.slice(startIndex, startIndex + 2);

              return (
                <div
                  key={virtualRow.key}
                  className="absolute left-0 grid w-full grid-cols-2 gap-4"
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {rowItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/wardrobe/${item.id}`}
                      className="block overflow-hidden rounded-lg border bg-white"
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={300}
                        height={300}
                        className="aspect-square w-full object-cover"
                      />

                      <div className="p-3">
                        <h2 className="font-medium">{item.name}</h2>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.category} · {item.color}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </AsyncState>
    </main>
  );
}

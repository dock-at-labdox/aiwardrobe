'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { ApiClient, AsyncState, type ErrorEnvelope } from '@aiwardrobe/shared-web';
import { useVirtualizer } from '@tanstack/react-virtual';

import { getToken } from '@/lib/get-token';

import type { WardrobeItem } from './mock-data';

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Footwear', 'Accessories'];
const ROW_HEIGHT = 260;
const COLUMN_COUNT = 4;

export default function WardrobeList() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorEnvelope | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiClient = new ApiClient(undefined, { tokenProvider: getToken });

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

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') {
      return items;
    }

    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  const rowCount = Math.ceil(filteredItems.length / COLUMN_COUNT);

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 3,
  });

  // Reset scroll when the filter changes, otherwise a shorter list
  // can be left scrolled past its end.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    rowVirtualizer.scrollToIndex(0);
  }, [selectedCategory, rowVirtualizer]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Your wardrobe</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              selectedCategory === category
                ? 'border-primary bg-primary text-primary-foreground'
                : 'hover:bg-muted/50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && filteredItems.length === 0}
        loadingMessage="Loading your wardrobe..."
        emptyMessage="Add your first item to start building your wardrobe."
      >
        <div ref={scrollRef} className="h-[600px] overflow-auto">
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const startIndex = virtualRow.index * COLUMN_COUNT;
              const rowItems = filteredItems.slice(startIndex, startIndex + COLUMN_COUNT);

              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="grid grid-cols-2 gap-4 pb-4 sm:grid-cols-3 lg:grid-cols-4"
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
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
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
    </div>
  );
}

'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { ApiClient, AsyncState, type ErrorEnvelope } from '@aiwardrobe/shared-web';

import type { RecommendationResult } from './mock-data';

interface RecommendationResultsProps {
  resultId: string;
}

export default function RecommendationResults({ resultId }: RecommendationResultsProps) {
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorEnvelope | null>(null);

  useEffect(() => {
    const apiClient = new ApiClient();

    apiClient
      .get<RecommendationResult>(`/v1/style/results/${resultId}`)
      .then((response) => {
        setResult(response);
        setError(null);
      })
      .catch((err) => {
        setError(err as ErrorEnvelope);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [resultId]);

  const conflicts =
    error?.error.code === 'CONSTRAINT_CONFLICT' && Array.isArray(error.error.details?.conflicts)
      ? error.error.details.conflicts
      : [];

  if (error?.error.code === 'INSUFFICIENT_WARDROBE') {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold">Your recommendations</h1>
        <p className="mt-4 text-gray-600">Add more items for this occasion.</p>
      </main>
    );
  }

  if (error?.error.code === 'CONSTRAINT_CONFLICT') {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold">Your recommendations</h1>
        <p className="mt-4 text-gray-600">Some of your selected items conflict:</p>

        <ul className="mt-3 list-disc pl-6">
          {conflicts.map((conflict) => (
            <li key={String(conflict)}>{String(conflict)}</li>
          ))}
        </ul>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your style recommendations</h1>
        <p className="mt-2 text-gray-600">Three ways to wear the items in your wardrobe.</p>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && !result}
        loadingMessage="Building your looks. Checking your wardrobe and preparing recommendations..."
        emptyMessage="No recommendations are available yet."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {result?.looks.map((look) => (
            <article key={look.id} className="overflow-hidden rounded-xl border bg-white">
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{look.label}</h2>
                  <span className="text-lg font-bold">{look.overallScore}/100</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3">
                {look.items.map((item) => (
                  <div key={item.id}>
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={300}
                      height={300}
                      className="aspect-square w-full rounded-lg object-cover"
                    />
                    <p className="mt-1 text-xs text-gray-600">{item.name}</p>
                  </div>
                ))}
              </div>

              <div className="border-t p-4">
                <h3 className="font-medium">Score breakdown</h3>

                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt>Color</dt>
                    <dd>{look.scores.color}/10</dd>
                  </div>

                  <div className="flex justify-between">
                    <dt>Occasion</dt>
                    <dd>{look.scores.occasion}/10</dd>
                  </div>

                  <div className="flex justify-between">
                    <dt>Compatibility</dt>
                    <dd>{look.scores.compatibility}/10</dd>
                  </div>
                </dl>
              </div>

              <div className="border-t p-4">
                <h3 className="font-medium">Why this look</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{look.explanation}</p>
              </div>

              <div className="flex gap-2 border-t p-4">
                <button
                  type="button"
                  className="flex-1 rounded-md border px-3 py-2 text-sm font-medium"
                >
                  Refine
                </button>

                <button
                  type="button"
                  className="flex-1 rounded-md border px-3 py-2 text-sm font-medium"
                >
                  Substitute
                </button>
              </div>
            </article>
          ))}
        </div>
      </AsyncState>
    </main>
  );
}

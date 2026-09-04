'use client';

import { useEffect, useState } from 'react';
import { Shirt, TrendingUp, AlertCircle } from 'lucide-react';

import { ApiClient, AsyncState, type ErrorEnvelope } from '@aiwardrobe/shared-web';

import { getToken } from '@/lib/get-token';

type Insights = {
  totalItems: number;
  itemsWornThisMonth: number;
  neverWorn: number;
  mostWorn: { name: string; timesWorn: number };
  byCategory: { category: string; count: number }[];
};

const apiClient = new ApiClient(undefined, { tokenProvider: getToken });

export default function InsightsScreen() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorEnvelope | null>(null);

  useEffect(() => {
    apiClient
      .get<Insights>('/v1/insights')
      .then((response) => {
        setInsights(response);
        setError(null);
      })
      .catch((err) => {
        setError(err as ErrorEnvelope);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const maxCount = insights ? Math.max(...insights.byCategory.map((entry) => entry.count), 1) : 1;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Insights</h1>
        <p className="mt-2 text-sm text-muted-foreground">How you actually use what you own.</p>
      </header>

      <AsyncState
        loading={loading}
        error={error}
        empty={!loading && !insights}
        loadingMessage="Working out your patterns..."
        emptyMessage="Add a few items and wear them to start seeing patterns here."
      >
        {insights && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border bg-card p-5">
                <Shirt className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <p className="mt-3 text-2xl font-bold">{insights.totalItems}</p>
                <p className="mt-1 text-sm text-muted-foreground">Items in your wardrobe</p>
              </div>

              <div className="rounded-xl border bg-card p-5">
                <TrendingUp className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <p className="mt-3 text-2xl font-bold">{insights.itemsWornThisMonth}</p>
                <p className="mt-1 text-sm text-muted-foreground">Worn this month</p>
              </div>

              <div className="rounded-xl border bg-card p-5">
                <AlertCircle className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <p className="mt-3 text-2xl font-bold">{insights.neverWorn}</p>
                <p className="mt-1 text-sm text-muted-foreground">Never worn yet</p>
              </div>
            </div>

            <section className="rounded-xl border bg-card p-5">
              <h2 className="text-lg font-semibold">Most worn</h2>

              <div className="mt-3 flex items-baseline justify-between gap-4">
                <p className="font-medium">{insights.mostWorn.name}</p>
                <p className="text-sm text-muted-foreground">
                  {insights.mostWorn.timesWorn}{' '}
                  {insights.mostWorn.timesWorn === 1 ? 'time' : 'times'}
                </p>
              </div>
            </section>

            <section className="rounded-xl border bg-card p-5">
              <h2 className="text-lg font-semibold">What you own</h2>

              <div className="mt-4 space-y-3">
                {insights.byCategory.map((entry) => (
                  <div key={entry.category}>
                    <div className="flex items-baseline justify-between gap-4 text-sm">
                      <span>{entry.category}</span>
                      <span className="text-muted-foreground">{entry.count}</span>
                    </div>

                    {/* Bar plus the number above, so it never relies on the bar alone. */}
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(entry.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {insights.neverWorn > 0 && (
              <p className="text-sm text-muted-foreground">
                You have {insights.neverWorn} {insights.neverWorn === 1 ? 'item' : 'items'} you have
                not worn yet. Try adding one to an occasion to see how it fits in.
              </p>
            )}
          </div>
        )}
      </AsyncState>
    </div>
  );
}

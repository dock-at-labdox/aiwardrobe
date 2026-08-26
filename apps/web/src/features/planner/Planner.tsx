'use client';

import { useEffect, useState } from 'react';

import { ApiClient, AsyncState, type ErrorEnvelope } from '@aiwardrobe/shared-web';

import type { SavedLook, WearEvent } from './mock-data';

export default function Planner() {
  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [wearEvents, setWearEvents] = useState<WearEvent[]>([]);

  const [loadingLooks, setLoadingLooks] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [looksError, setLooksError] = useState<ErrorEnvelope | null>(null);
  const [historyError, setHistoryError] = useState<ErrorEnvelope | null>(null);

  const [wornLoadingId, setWornLoadingId] = useState<string | null>(null);
  const [wornError, setWornError] = useState<string | null>(null);

  useEffect(() => {
    const apiClient = new ApiClient();

    apiClient
      .get<{ looks: SavedLook[] }>('/v1/planner/looks')
      .then((response) => {
        setLooks(response.looks);
        setLooksError(null);
      })
      .catch((err) => {
        setLooksError(err as ErrorEnvelope);
      })
      .finally(() => {
        setLoadingLooks(false);
      });

    apiClient
      .get<{ events: WearEvent[] }>('/v1/planner/wear-history')
      .then((response) => {
        setWearEvents(response.events);
        setHistoryError(null);
      })
      .catch((err) => {
        setHistoryError(err as ErrorEnvelope);
      })
      .finally(() => {
        setLoadingHistory(false);
      });
  }, []);

  async function markAsWorn(lookId: string) {
    setWornLoadingId(lookId);
    setWornError(null);

    try {
      const apiClient = new ApiClient();

      const response = await apiClient.post<WearEvent>(`/v1/planner/looks/${lookId}/worn`, {});

      setWearEvents((current) => [response, ...current]);
    } catch {
      setWornError('Could not mark this look as worn. Please try again.');
    } finally {
      setWornLoadingId(null);
    }
  }

  function getLookTitle(lookId: string) {
    return looks.find((look) => look.id === lookId)?.title ?? 'Unknown look';
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Planner</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Save your favorite looks and keep track of what you wear.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold">Saved Looks</h2>

        <div className="mt-4">
          <AsyncState
            loading={loadingLooks}
            error={looksError}
            empty={!loadingLooks && looks.length === 0}
            loadingMessage="Loading your saved looks..."
            emptyMessage="You have no saved looks yet."
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {looks.map((look) => (
                <article key={look.id} className="rounded-lg border p-4">
                  <h3 className="font-semibold">{look.title}</h3>

                  <p className="mt-1 text-sm text-muted-foreground">Status: {look.status}</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Created {new Date(look.createdAt).toLocaleDateString()}
                  </p>

                  <button
                    type="button"
                    onClick={() => markAsWorn(look.id)}
                    disabled={wornLoadingId === look.id}
                    className="mt-4 rounded-md border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {wornLoadingId === look.id ? 'Marking...' : 'Mark as Worn'}
                  </button>
                </article>
              ))}
            </div>
          </AsyncState>
        </div>

        {wornError && <p className="mt-3 text-sm text-red-600">{wornError}</p>}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Wear History</h2>

        <div className="mt-4">
          <AsyncState
            loading={loadingHistory}
            error={historyError}
            empty={!loadingHistory && wearEvents.length === 0}
            loadingMessage="Loading your wear history..."
            emptyMessage="You have no wear history yet."
          >
            <div className="space-y-3">
              {wearEvents.map((event) => (
                <article key={event.id} className="rounded-lg border p-4">
                  <h3 className="font-semibold">{getLookTitle(event.savedLookId)}</h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Worn on {new Date(`${event.wornAt}T00:00:00`).toLocaleDateString()}
                  </p>

                  {event.audienceKey && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Occasion: {event.audienceKey}
                    </p>
                  )}

                  {event.rating !== undefined && (
                    <p className="mt-1 text-sm">Rating: {event.rating}/5</p>
                  )}

                  {event.notes && (
                    <p className="mt-1 text-sm text-muted-foreground">{event.notes}</p>
                  )}
                </article>
              ))}
            </div>
          </AsyncState>
        </div>
      </section>
    </main>
  );
}

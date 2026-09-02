'use client';

import { useEffect, useState } from 'react';
import { ApiClient, AsyncState, type ErrorEnvelope } from '@aiwardrobe/shared-web';

interface ModerationItem {
  id: string;
  type: string;
  status: 'PENDING' | 'FLAGGED';
  description: string;
}

export default function ModerationPage() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorEnvelope | null>(null);

  useEffect(() => {
    const apiClient = new ApiClient();

    apiClient
      .get<{ items: ModerationItem[] }>('/v1/admin/moderation/queue')
      .then((data) => {
        setItems(data.items);
        setError(null);
      })
      .catch((err) => {
        setError(err as ErrorEnvelope);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Moderation Review</h1>
      <p className="mt-2 text-gray-600">Review moderation items and take operational actions.</p>

      <div className="mt-6">
        <AsyncState
          loading={loading}
          error={error}
          empty={!loading && items.length === 0}
          loadingMessage="Loading moderation queue..."
          emptyMessage="No moderation items found."
        >
          <div className="rounded-lg border p-4">
            {items.map((item) => (
              <div key={item.id} className="border-b py-4 last:border-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{item.type}</p>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${
                      item.status === 'FLAGGED'
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  >
                    {item.status === 'FLAGGED' ? '[!] Flagged' : 'Pending'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </AsyncState>
      </div>
    </main>
  );
}

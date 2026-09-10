'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ApiClient, AsyncState, type ErrorEnvelope } from '@aiwardrobe/shared-web';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  email: string;
}

export default function SupportPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorEnvelope | null>(null);

  useEffect(() => {
    const apiClient = new ApiClient();

    apiClient
      .get<{ users: User[] }>('/v1/admin/support/users')
      .then((data) => {
        setUsers(data.users);
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
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Support Lookups</h1>
            <p className="mt-2 text-gray-600">Find users and support information.</p>
          </div>

          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <div className="mt-6">
          <AsyncState
            loading={loading}
            error={error}
            empty={!loading && users.length === 0}
            loadingMessage="Loading support users..."
            emptyMessage="No users found."
          >
            <div className="rounded-lg border p-4">
              {users.map((user) => (
                <div key={user.id} className="border-b py-3 last:border-0">
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-gray-500">{user.id}</p>
                </div>
              ))}
            </div>
          </AsyncState>
        </div>
      </div>
    </main>
  );
}

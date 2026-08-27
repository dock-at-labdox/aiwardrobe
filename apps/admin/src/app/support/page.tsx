'use client';

import { useEffect, useState } from 'react';
import { ApiClient } from '@aiwardrobe/shared-web';

interface User {
  id: string;
  email: string;
}

export default function SupportPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiClient = new ApiClient();

    apiClient
      .get<{ users: User[] }>('/v1/admin/support/users')
      .then((data) => {
        setUsers(data.users);
      })
      .catch(() => {
        setError('Unable to load support users.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Support Lookups</h1>
      <p className="mt-2 text-gray-600">Find users and support information.</p>

      <div className="mt-6 rounded-lg border p-4">
        {loading && <p>Loading support users...</p>}

        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && users.length === 0 && <p>No users found.</p>}

        {!loading &&
          !error &&
          users.map((user) => (
            <div key={user.id} className="border-b py-3 last:border-0">
              <p className="font-medium">{user.email}</p>
              <p className="text-sm text-gray-500">{user.id}</p>
            </div>
          ))}
      </div>
    </main>
  );
}

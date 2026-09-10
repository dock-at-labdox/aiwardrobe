'use client';

import { useEffect, useState } from 'react';
import { ApiClient, AsyncState, type ErrorEnvelope } from '@aiwardrobe/shared-web';

interface ReportOverview {
  totalUsers: number;
  activeUsers: number;
  wardrobeItems: number;
  moderationPending: number;
}

export default function ReportsPage() {
  const [report, setReport] = useState<ReportOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorEnvelope | null>(null);

  useEffect(() => {
    const apiClient = new ApiClient();

    apiClient
      .get<ReportOverview>('/v1/admin/reports/overview')
      .then((data) => {
        setReport(data);
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
      <h1 className="text-2xl font-bold">Operational Reporting</h1>
      <p className="mt-2 text-gray-600">View operational metrics and system activity.</p>

      <div className="mt-6">
        <AsyncState
          loading={loading}
          error={error}
          empty={!loading && !report}
          loadingMessage="Loading operational report..."
          emptyMessage="No report data available."
        >
          {report && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border p-5">
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="mt-2 text-2xl font-bold">{report.totalUsers}</p>
              </div>

              <div className="rounded-lg border p-5">
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="mt-2 text-2xl font-bold">{report.activeUsers}</p>
              </div>

              <div className="rounded-lg border p-5">
                <p className="text-sm text-gray-500">Wardrobe Items</p>
                <p className="mt-2 text-2xl font-bold">{report.wardrobeItems}</p>
              </div>

              <div className="rounded-lg border p-5">
                <p className="text-sm text-gray-500">Pending Moderation</p>
                <p className="mt-2 text-2xl font-bold">{report.moderationPending}</p>
              </div>
            </div>
          )}
        </AsyncState>
      </div>
    </main>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">AI Wardrobe Admin</h1>
            <p className="text-sm text-gray-500">Operations dashboard</p>
          </div>

          <Button variant="outline">Sign out</Button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
            <p className="mt-2 text-gray-600">
              Manage support, moderation, and operational workflows.
            </p>
          </div>

          <Link href="/support">
            <Button>Open Support Lookups</Button>
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/support" className="block rounded-lg border p-5 hover:bg-gray-50">
            <h3 className="font-semibold">Support Lookups</h3>
            <p className="mt-2 text-sm text-gray-600">
              Find users, wardrobe items, and recommendation results.
            </p>
          </Link>

          <Link href="/moderation" className="block rounded-lg border p-5 hover:bg-gray-50">
            <h3 className="font-semibold">Moderation Review</h3>
            <p className="mt-2 text-sm text-gray-600">
              Review moderation items and take operational actions.
            </p>
          </Link>

          <div className="rounded-lg border p-5">
            <h3 className="font-semibold">Operational Reporting</h3>
            <p className="mt-2 text-sm text-gray-600">
              View operational metrics and system activity.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

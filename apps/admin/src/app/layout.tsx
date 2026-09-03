import type { Metadata } from 'next';
import Link from 'next/link';
import MswProvider from '@/mocks/MswProvider';
import { ReactNode } from 'react';
import { AppProviders } from '@aiwardrobe/shared-web';

import { getSession } from '@/lib/session';

import './globals.css';

export const metadata: Metadata = {
  title: 'AI Wardrobe Admin',
  description: 'AI Wardrobe administration',
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await getSession();

  if (session.role !== 'Operator' && session.role !== 'Engineering Lead') {
    return (
      <html lang="en">
        <body>
          <main className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Access denied</h1>
              <p className="mt-2 text-gray-600">
                You do not have permission to access the admin application.
              </p>
            </div>
          </main>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <MswProvider>
          <AppProviders>
            <header className="border-b px-6 py-4">
              <nav className="mx-auto flex max-w-7xl items-center gap-6">
                <Link href="/" className="font-semibold">
                  AI Wardrobe Admin
                </Link>
                <Link href="/support">Support</Link>
                <Link href="/moderation">Moderation</Link>
                <Link href="/reports">Reports</Link>
              </nav>
            </header>

            {children}
          </AppProviders>
        </MswProvider>
      </body>
    </html>
  );
}

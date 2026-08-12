import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { AppProviders } from '@aiwardrobe/shared-web';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Wardrobe',
  description: 'Professional wardrobe planning',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

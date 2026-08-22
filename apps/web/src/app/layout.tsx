import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { AppProviders } from '@aiwardrobe/shared-web';
import './globals.css';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';
import MswProvider from '@/mocks/MswProvider';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'AI Wardrobe',
  description: 'Professional wardrobe planning',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={cn('font-sans', geist.variable)}>
      <body>
        <MswProvider>
          <AppProviders>{children}</AppProviders>
        </MswProvider>
      </body>
    </html>
  );
}

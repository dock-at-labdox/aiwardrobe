import Link from 'next/link';
import { ReactNode } from 'react';
import { Shirt, Calendar, User } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/wardrobe', label: 'Wardrobe', icon: Shirt },
  { href: '/planner', label: 'Planner', icon: Calendar },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function ApplicationLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/wardrobe" className="font-semibold">
            AttireIQ
          </Link>

          <nav className="hidden gap-6 sm:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:pb-6">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background sm:hidden">
        <div className="flex">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-1 flex-col items-center gap-1 py-3 text-xs text-muted-foreground hover:text-foreground"
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

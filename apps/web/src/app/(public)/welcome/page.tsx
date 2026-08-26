import Link from 'next/link';
import { Shirt, Sparkles, Camera } from 'lucide-react';

const FEATURES = [
  {
    icon: Camera,
    title: 'Photograph what you own',
    text: 'Snap each garment once. We work out the true colour and keep it in your wardrobe.',
  },
  {
    icon: Sparkles,
    title: 'Get three looks, explained',
    text: 'Tell us the occasion and we suggest three outfits from your own clothes, with the reasoning.',
  },
  {
    icon: Shirt,
    title: 'See it before you wear it',
    text: 'Optionally preview yourself in a look before you commit to it.',
  },
];

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:py-24">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Shirt className="h-7 w-7 text-primary" aria-hidden="true" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">AttireIQ</h1>

          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Dress well for the meeting that matters, using the clothes already in your wardrobe.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Get started
            </Link>

            <Link
              href="/sign-in"
              className="inline-flex h-11 items-center justify-center rounded-lg border px-8 text-sm font-medium transition hover:bg-muted/50"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-xl border bg-card p-5">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="mt-3 text-sm font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.text}</p>
              </div>
            );
          })}
        </div>

        <p className="mt-16 text-center text-xs text-muted-foreground">
          Your photos are yours. You choose what we process, and you can delete everything at any
          time.
        </p>
      </div>
    </main>
  );
}

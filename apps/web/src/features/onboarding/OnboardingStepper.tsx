'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const STORAGE_KEY = 'attireiq-onboarding';

const ROLES = ['Sales', 'Consulting', 'Account management', 'Client success', 'Other'];

const STYLE_PREFERENCES = [
  { id: 'classic', label: 'Classic', hint: 'Safe, understated, never out of place' },
  { id: 'modern', label: 'Modern', hint: 'Current cuts, a bit of contrast' },
  { id: 'expressive', label: 'Expressive', hint: 'Colour and texture, happy to stand out' },
];

type OnboardingData = {
  step: number;
  role: string;
  impression: string;
  stylePreference: string;
};

const EMPTY: OnboardingData = {
  step: 1,
  role: '',
  impression: '',
  stylePreference: '',
};

const TOTAL_STEPS = 3;

// Read saved progress during the first render rather than inside an effect,
// so a user who drops off mid-way picks up where they left off.
function loadSaved(): OnboardingData {
  if (typeof window === 'undefined') return EMPTY;

  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as OnboardingData;
  } catch {
    // corrupted value, start fresh
  }

  return EMPTY;
}

export default function OnboardingStepper() {
  const router = useRouter();
  const [data, setData] = useState<OnboardingData>(loadSaved);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  function update(patch: Partial<OnboardingData>) {
    setData((current) => ({ ...current, ...patch }));
  }

  function next() {
    update({ step: Math.min(data.step + 1, TOTAL_STEPS) });
  }

  function back() {
    update({ step: Math.max(data.step - 1, 1) });
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-8 flex items-center gap-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                n < data.step
                  ? 'bg-primary text-primary-foreground'
                  : n === data.step
                    ? 'border-2 border-primary text-primary'
                    : 'border-2 border-muted text-muted-foreground'
              }`}
            >
              {n < data.step ? <Check className="h-4 w-4" aria-hidden="true" /> : n}
            </div>
            {n < TOTAL_STEPS && (
              <div className={`h-0.5 flex-1 ${n < data.step ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {data.step === 1 && (
        <section>
          <h1 className="text-2xl font-bold">What kind of work do you do?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Client meetings and desk days call for different things, so this helps us suggest looks
            that fit your week.
          </p>

          <div className="mt-6 space-y-2">
            {ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => update({ role })}
                className={`w-full rounded-lg border p-4 text-left text-sm transition-colors ${
                  data.role === role ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <Button onClick={next} className="mt-8 w-full">
            Continue
          </Button>

          <button
            type="button"
            onClick={next}
            className="mt-3 w-full text-sm text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </button>
        </section>
      )}

      {data.step === 2 && (
        <section>
          <h1 className="text-2xl font-bold">How do you like to dress?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            No wrong answer here. It just sets the starting point for the looks we suggest.
          </p>

          <div className="mt-6 space-y-2">
            {STYLE_PREFERENCES.map((pref) => (
              <button
                key={pref.id}
                type="button"
                onClick={() => update({ stylePreference: pref.id })}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${
                  data.stylePreference === pref.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="text-sm font-medium">{pref.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{pref.hint}</div>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <label htmlFor="impression" className="text-sm font-medium">
              Anything you want to come across as? (optional)
            </label>
            <Textarea
              id="impression"
              value={data.impression}
              onChange={(e) => update({ impression: e.target.value })}
              placeholder="e.g. approachable but credible"
              className="mt-2"
            />
          </div>

          <div className="mt-8 flex gap-3">
            <Button variant="outline" onClick={back} className="flex-1">
              Back
            </Button>
            <Button onClick={next} className="flex-1">
              Continue
            </Button>
          </div>
        </section>
      )}

      {data.step === 3 && (
        <section>
          <h1 className="text-2xl font-bold">Add your first few items</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Around 8 to 12 pieces you actually wear to work is enough to get useful suggestions. You
            can add more any time.
          </p>

          <div className="mt-6 rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Photograph or upload a garment to get started.
            </p>
            <Button className="mt-4" onClick={() => router.push('/wardrobe/new')}>
              Add an item
            </Button>
          </div>

          <div className="mt-8 flex gap-3">
            <Button variant="outline" onClick={back} className="flex-1">
              Back
            </Button>
            <Button onClick={() => router.push('/wardrobe')} className="flex-1">
              Done for now
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

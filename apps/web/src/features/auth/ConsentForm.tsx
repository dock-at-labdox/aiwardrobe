'use client';

import { useState } from 'react';

type ConsentState = {
  wardrobeProcessing: boolean;
  personalization: boolean;
  tryOn: boolean;
  analytics: boolean;
};

export default function ConsentForm() {
  const [consents, setConsents] = useState<ConsentState>({
    wardrobeProcessing: false,
    personalization: false,
    tryOn: false,
    analytics: false,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  function handleToggle(purpose: keyof ConsentState) {
    setConsents((current) => ({
      ...current,
      [purpose]: !current[purpose],
    }));

    setError('');
  }

  async function handleSave() {
    setLoading(true);
    setError('');

    try {
      // Backend API will be connected later.
      // Task 2 ApiClient + /v1/consents will be used here.

      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('Current consent state:', consents);
    } catch {
      setError('Unable to save your consent settings. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Privacy & consent</h1>

        <p className="mt-2 text-gray-600">
          Choose which features you want to allow. You can change these choices later.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="space-y-4">
        <ConsentItem
          title="Wardrobe processing"
          description="Allow us to process your wardrobe information to provide wardrobe features."
          checked={consents.wardrobeProcessing}
          onChange={() => handleToggle('wardrobeProcessing')}
        />

        <ConsentItem
          title="Personalization"
          description="Allow us to use your preferences to personalize your experience."
          checked={consents.personalization}
          onChange={() => handleToggle('personalization')}
        />

        <ConsentItem
          title="Try-on"
          description="Allow processing required to provide virtual try-on features."
          checked={consents.tryOn}
          onChange={() => handleToggle('tryOn')}
        />

        <ConsentItem
          title="Analytics"
          description="Allow analytics data to be used to improve the product."
          checked={consents.analytics}
          onChange={() => handleToggle('analytics')}
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="w-full rounded-md bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save preferences'}
      </button>
    </section>
  );
}

type ConsentItemProps = {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
};

function ConsentItem({ title, description, checked, onChange }: ConsentItemProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-md border p-4">
      <input type="checkbox" checked={checked} onChange={onChange} className="mt-1 h-4 w-4" />

      <div>
        <p className="font-medium">{title}</p>

        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>
    </label>
  );
}

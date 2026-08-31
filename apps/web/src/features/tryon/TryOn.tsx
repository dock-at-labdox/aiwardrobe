'use client';

import { useState } from 'react';

type TryOnError = 'TRYON_INPUT_INVALID' | 'TRYON_FIDELITY_FAILED' | 'QUOTA_EXCEEDED' | null;

type TryOnProps = {
  itemId: string;
};

export default function TryOn({ itemId }: TryOnProps) {
  const [enabled, setEnabled] = useState(false);
  const [sourcePhoto, setSourcePhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TryOnError>(null);
  const [completed, setCompleted] = useState(false);

  function handlePhotoChange(file: File | undefined) {
    setError(null);
    setCompleted(false);

    if (!file) {
      setSourcePhoto(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('TRYON_INPUT_INVALID');
      setSourcePhoto(null);
      return;
    }

    setSourcePhoto(file);
  }

  async function handleGenerate() {
    if (!sourcePhoto) {
      setError('TRYON_INPUT_INVALID');
      return;
    }

    setLoading(true);
    setError(null);
    setCompleted(false);

    // Temporary UI simulation.
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setLoading(false);

    // Temporary test: simulate a quality-gate failure.
    setError('TRYON_FIDELITY_FAILED');
  }

  if (!enabled) {
    return (
      <section className="rounded-lg border bg-background p-5">
        <h2 className="text-lg font-semibold">Virtual Try-On</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Try this wardrobe item virtually on your photo. This is completely optional and will never
          be enabled automatically.
        </p>

        <button
          type="button"
          onClick={() => setEnabled(true)}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try it on
        </button>

        <p className="mt-2 text-xs text-muted-foreground">
          You can continue using AttireIQ without using Try-On.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border bg-background p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Virtual Try-On</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a clear source photo to see how this item may look on you.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEnabled(false);
            setSourcePhoto(null);
            setError(null);
            setCompleted(false);
          }}
          className="text-sm text-muted-foreground underline"
        >
          Skip
        </button>
      </div>

      <div className="mt-5">
        <label className="block text-sm font-medium">Source photo</label>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => handlePhotoChange(event.target.files?.[0])}
          className="mt-2 block w-full rounded-md border p-2 text-sm"
        />

        <p className="mt-2 text-xs text-muted-foreground">
          Use a clear, well-lit photo with your full body visible. Avoid blurry, dark, cropped, or
          heavily obstructed photos.
        </p>
      </div>

      {error === 'TRYON_INPUT_INVALID' && (
        <div
          role="alert"
          className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-4"
        >
          <p className="font-medium">We need a better source photo.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Please upload a clear, well-lit photo with your body visible and minimal obstruction.
          </p>
        </div>
      )}

      {error === 'TRYON_FIDELITY_FAILED' && (
        <div
          role="alert"
          className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-4"
        >
          <p className="font-medium">Try-On could not meet the quality bar.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This generation was not charged. You can retry with the same or a better source photo.
          </p>

          <button
            type="button"
            onClick={handleGenerate}
            className="mt-3 rounded-md border px-4 py-2 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {error === 'QUOTA_EXCEEDED' && (
        <div role="alert" className="mt-4 rounded-md border p-4">
          <p className="font-medium">Try-On limit reached.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            You can upgrade your plan or wait until your Try-On quota resets.
          </p>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Upgrade
            </button>

            <button
              type="button"
              className="rounded-md border px-4 py-2 text-sm"
              onClick={() => setError(null)}
            >
              Wait
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div role="status" className="mt-5 rounded-md border p-4">
          <p className="font-medium">Generating your Try-On...</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This can take up to about 60 seconds. Please keep this page open.
          </p>
        </div>
      )}

      {completed && !loading && !error && (
        <div className="mt-5 rounded-md border p-4">
          <p className="font-medium">Try-On generation complete.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your generated look is ready to review.
          </p>
        </div>
      )}

      <button
        type="button"
        disabled={!sourcePhoto || loading}
        onClick={handleGenerate}
        className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Try-On'}
      </button>

      <p className="mt-2 text-xs text-muted-foreground">Item: {itemId}</p>
    </section>
  );
}

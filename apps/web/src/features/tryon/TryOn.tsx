'use client';

import { useState } from 'react';

import { ApiClient, AsyncState, type ErrorEnvelope } from '@aiwardrobe/shared-web';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

type TryOnProps = {
  itemId: string;
};

type TryOnResponse = {
  id: string;
  status: 'complete';
  remainingQuota: number;
  resultUrl?: string;
};

export default function TryOn({ itemId }: TryOnProps) {
  const [enabled, setEnabled] = useState(false);
  const [sourcePhoto, setSourcePhoto] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState<ErrorEnvelope | null>(null);
  const [completed, setCompleted] = useState(false);
  const [remainingQuota, setRemainingQuota] = useState(3);

  function handlePhotoChange(file: File | undefined) {
    setRequestError(null);
    setCompleted(false);

    if (!file) {
      setSourcePhoto(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setSourcePhoto(null);

      setRequestError({
        error: {
          code: 'TRYON_INPUT_INVALID',
          message: 'Please upload a valid image file.',
          correlation_id: crypto.randomUUID(),
        },
      });

      return;
    }

    setSourcePhoto(file);
  }

  async function handleGenerate() {
    if (!sourcePhoto) {
      setRequestError({
        error: {
          code: 'TRYON_INPUT_INVALID',
          message: 'Please upload a source photo before generating a Try-On.',
          correlation_id: crypto.randomUUID(),
        },
      });

      return;
    }

    if (remainingQuota <= 0) {
      setRequestError({
        error: {
          code: 'QUOTA_EXCEEDED',
          message: 'Your Try-On limit has been reached.',
          correlation_id: crypto.randomUUID(),
        },
      });

      return;
    }

    setLoading(true);
    setRequestError(null);
    setCompleted(false);

    try {
      const apiClient = new ApiClient();

      const response = await apiClient.post<TryOnResponse>('/v1/tryon/requests', {
        itemId,
        sourcePhoto: {
          fileName: sourcePhoto.name,
          contentType: sourcePhoto.type,
          size: sourcePhoto.size,
        },
      });

      setRemainingQuota(response.remainingQuota);
      setCompleted(true);
    } catch (error) {
      setRequestError(error as ErrorEnvelope);
    } finally {
      setLoading(false);
    }
  }

  function handleSkip() {
    setEnabled(false);
    setSourcePhoto(null);
    setRequestError(null);
    setCompleted(false);
  }

  if (!enabled) {
    return (
      <section className="rounded-lg border bg-background p-5">
        <h2 className="text-lg font-semibold">Virtual Try-On</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Try this wardrobe item virtually on your photo. This is completely optional and will never
          be enabled automatically.
        </p>

        <Button type="button" onClick={() => setEnabled(true)} className="mt-4">
          Try it on
        </Button>

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

        <Button type="button" variant="ghost" onClick={handleSkip}>
          Skip
        </Button>
      </div>

      <div className="mt-4 rounded-md border p-3">
        <p className="text-sm font-medium">Try-On quota</p>

        <p className="mt-1 text-sm text-muted-foreground">
          {remainingQuota} of 5 try-ons remaining this month.
        </p>
      </div>

      <div className="mt-5">
        <label className="block text-sm font-medium">Source photo</label>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => handlePhotoChange(event.target.files?.[0])}
          className="mt-2 block w-full rounded-md border p-2 text-sm"
          disabled={loading}
        />

        <p className="mt-2 text-xs text-muted-foreground">
          Use a clear, well-lit photo with your full body visible. Avoid blurry, dark, cropped, or
          heavily obstructed photos.
        </p>
      </div>

      <AsyncState
        loading={loading}
        error={requestError}
        empty={false}
        loadingMessage="Generating your Try-On..."
      >
        {!loading && (
          <>
            {requestError?.error.code === 'TRYON_INPUT_INVALID' && (
              <div
                role="alert"
                className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-4"
              >
                <p className="font-medium">We need a better source photo.</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Please upload a clear, well-lit photo with your body visible and minimal
                  obstruction.
                </p>
              </div>
            )}

            {requestError?.error.code === 'TRYON_FIDELITY_FAILED' && (
              <div
                role="alert"
                className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-4"
              >
                <p className="font-medium">Try-On could not meet the quality bar.</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  This generation was not charged. You can retry with the same or a better source
                  photo.
                </p>

                <Button type="button" variant="outline" onClick={handleGenerate} className="mt-3">
                  Retry
                </Button>
              </div>
            )}

            {requestError?.error.code === 'QUOTA_EXCEEDED' && (
              <div role="alert" className="mt-4 rounded-md border p-4">
                <p className="font-medium">Try-On limit reached.</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  You can upgrade your plan or wait until your Try-On quota resets.
                </p>

                <div className="mt-3 flex gap-2">
                  <Link href="/billing">
                    <Button type="button">Upgrade</Button>
                  </Link>

                  <Button type="button" variant="outline" onClick={() => setRequestError(null)}>
                    Wait
                  </Button>
                </div>
              </div>
            )}

            {completed && !requestError && (
              <div className="mt-5 rounded-md border p-4">
                <p className="font-medium">Try-On generation complete.</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Your generated look is ready to review.
                </p>
              </div>
            )}

            {!requestError && !completed && (
              <Button
                type="button"
                disabled={loading || remainingQuota <= 0}
                onClick={handleGenerate}
                className="mt-5"
              >
                Generate Try-On
              </Button>
            )}
          </>
        )}
      </AsyncState>

      <p className="mt-2 text-xs text-muted-foreground">Item: {itemId}</p>
    </section>
  );
}

'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useRef, useState } from 'react';
import { getColorConfidence } from './color-confidence';

import type { ErrorEnvelope } from '@aiwardrobe/shared-schemas';
import { ApiClient, AsyncState } from '@aiwardrobe/shared-web';
import { Camera, CheckCircle2, Lightbulb, Shirt } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getToken } from '@/lib/get-token';

type UploadSession = {
  uploadUrl: string;
  itemId: string;
};

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const apiClient = new ApiClient('', { tokenProvider: getToken });

function createErrorEnvelope(code: string, message: string): ErrorEnvelope {
  return {
    error: {
      code,
      message,
      correlation_id: crypto.randomUUID(),
    },
  };
}

async function createUploadSession(file: File): Promise<UploadSession> {
  return apiClient.post<UploadSession>('/v1/wardrobe/uploads/sessions', {
    fileName: file.name,
    fileSize: file.size,
    contentType: file.type,
  });
}

export default function ItemCapture() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<ErrorEnvelope | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [feedback, setFeedback] = useState('');

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadError(null);
    setUploadSuccess(false);
    setFeedback('');

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setSelectedFile(null);
      setPreviewUrl('');
      setUploadError(
        createErrorEnvelope('INVALID_IMAGE_TYPE', 'Please choose a JPG, PNG, or WebP image.'),
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setPreviewUrl('');
      setUploadError(createErrorEnvelope('IMAGE_TOO_LARGE', 'Image must be smaller than 10 MB.'));
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const nextPreviewUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(nextPreviewUrl);
    setFeedback(getPhotoFeedback(file));
  }

  function getPhotoFeedback(file: File) {
    if (file.size < 100 * 1024) {
      return 'The image may be low quality. Try taking the photo in good lighting.';
    }

    return 'Good start. Make sure the whole garment is visible and well lit.';
  }

  function clearSelection() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl('');
    setFeedback('');
    setUploadError(null);
    setUploadSuccess(false);
    setIsUploading(false);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      setUploadError(createErrorEnvelope('FILE_REQUIRED', 'Please choose a garment photo first.'));
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const session = await createUploadSession(selectedFile);

      console.log('Mock upload completed:', {
        itemId: session.itemId,
        uploadUrl: session.uploadUrl,
        fileName: selectedFile.name,
      });

      const colorConfidence = getColorConfidence();

      if (colorConfidence < 0.5) {
        throw createErrorEnvelope(
          'COLOR_LOW_CONFIDENCE',
          'We could not confidently identify the colour. Please retake the photo or correct the colour manually.',
        );
      }

      setUploadSuccess(true);
    } catch (caughtError) {
      const error = caughtError as ErrorEnvelope;

      if (error?.error?.code && error?.error?.message) {
        setUploadError(error);
      } else {
        setUploadError(createErrorEnvelope('UPLOAD_FAILED', 'Upload failed. Please try again.'));
      }
    } finally {
      setIsUploading(false);
    }
  }

  const userErrorMessage = uploadError?.error?.message ?? '';

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-6 text-center sm:mb-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Shirt className="h-7 w-7 text-primary" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Add a wardrobe item</h1>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          Take a clear photo or choose an image of your garment.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
        <AsyncState loading={isUploading} error={null} loadingMessage="Uploading your garment...">
          {!previewUrl ? (
            <>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
                className="group w-full cursor-pointer rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/20 p-7 text-center transition-all hover:border-primary/40 hover:bg-primary/5 active:scale-[0.99] sm:p-9"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover:scale-105">
                  <Camera className="h-7 w-7 text-primary" aria-hidden="true" />
                </div>

                <h2 className="mt-4 text-base font-semibold">Upload or capture a garment photo</h2>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-5 text-muted-foreground">
                  Make sure the entire garment is visible and the photo has good lighting.
                </p>

                <div className="mt-5 inline-flex cursor-pointer rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90">
                  Choose photo
                </div>
              </button>

              <Input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
              />

              <div className="mt-4 rounded-xl border bg-muted/40 p-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background shadow-sm">
                    <Lightbulb className="h-4 w-4" aria-hidden="true" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">For better results</p>

                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      Use good lighting and make sure the entire garment is visible in the frame.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border bg-muted/20">
                <Image
                  src={previewUrl}
                  alt="Selected garment preview"
                  width={800}
                  height={600}
                  unoptimized
                  className="mx-auto max-h-[420px] w-full object-contain"
                />
              </div>

              {selectedFile && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border bg-muted/40 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{selectedFile.name}</p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Ready
                  </span>
                </div>
              )}

              {feedback && (
                <div className="mt-4 rounded-xl border bg-muted/40 p-4">
                  <div className="flex gap-3">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />

                    <p className="text-sm leading-5 text-muted-foreground">{feedback}</p>
                  </div>
                </div>
              )}

              {!uploadSuccess && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearSelection}
                  disabled={isUploading}
                  className="mt-4 w-full cursor-pointer rounded-xl"
                >
                  Choose another photo
                </Button>
              )}
            </>
          )}
        </AsyncState>

        {uploadError && selectedFile && !isUploading && (
          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <p className="font-semibold">Upload issue</p>

            <p className="mt-1 leading-5">{userErrorMessage}</p>

            <Button
              type="button"
              variant="outline"
              onClick={handleUpload}
              className="mt-3 cursor-pointer rounded-lg"
            >
              Try again
            </Button>
          </div>
        )}

        {uploadSuccess && !uploadError && (
          <div
            role="status"
            className="mt-4 rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-700"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />

              <div>
                <p className="font-semibold">Upload successful</p>

                <p className="mt-1 leading-5">Your wardrobe item is ready to be processed.</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearSelection}
                    className="rounded-lg"
                  >
                    Add another
                  </Button>

                  <Button
                    type="button"
                    onClick={() => router.push('/wardrobe')}
                    className="rounded-lg"
                  >
                    View wardrobe
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {previewUrl && !uploadSuccess && !uploadError && (
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="mt-4 h-11 w-full cursor-pointer rounded-xl text-sm font-semibold"
          >
            Upload garment
          </Button>
        )}

        {uploadError && !selectedFile && (
          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <p className="font-semibold">Upload issue</p>

            <p className="mt-1 leading-5">{userErrorMessage}</p>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
        Your photo will be uploaded securely for wardrobe processing.
      </p>
    </div>
  );
}

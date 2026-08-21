'use client';

import { ChangeEvent, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

type MockUploadSession = {
  uploadUrl: string;
  itemId: string;
};

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function ItemCapture() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError('');
    setUploadStatus('idle');
    setFeedback('');

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setSelectedFile(null);
      setPreviewUrl('');
      setError('Please choose a JPG, PNG, or WebP image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setPreviewUrl('');
      setError('Image must be smaller than 10 MB.');
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
    setError('');
    setUploadStatus('idle');

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  async function createMockUploadSession(): Promise<MockUploadSession> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      uploadUrl: 'mock://wardrobe/upload',
      itemId: crypto.randomUUID(),
    };
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError('Please choose a garment photo first.');
      return;
    }

    setUploadStatus('uploading');
    setError('');

    try {
      const session = await createMockUploadSession();

      await new Promise((resolve) => setTimeout(resolve, 800));

      console.log('Mock upload completed:', {
        itemId: session.itemId,
        uploadUrl: session.uploadUrl,
        fileName: selectedFile.name,
      });

      const colorConfidence = 0.92;

      if (colorConfidence < 0.5) {
        setUploadStatus('error');
        setError(
          'COLOR_LOW_CONFIDENCE: We could not confidently identify the colour. Please retake the photo or correct the colour manually.',
        );
        return;
      }

      setUploadStatus('success');
    } catch {
      setUploadStatus('error');
      setError('Upload failed. Please try again.');
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40 px-4 py-8 sm:py-12">
      <section className="mx-auto w-full max-w-xl">
        {/* Header */}
        <div className="mb-6 text-center sm:mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <span className="text-2xl">👕</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Add a wardrobe item</h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
            Take a clear photo or choose an image of your garment.
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
          {!previewUrl ? (
            <>
              {/* Upload Area */}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploadStatus === 'uploading'}
                className="group w-full cursor-pointer rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/20 p-7 text-center transition-all hover:border-primary/40 hover:bg-primary/5 active:scale-[0.99] sm:p-9"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover:scale-105">
                  <span className="text-2xl">📷</span>
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
                disabled={uploadStatus === 'uploading'}
                className="hidden"
              />

              {/* Tips */}
              <div className="mt-4 rounded-xl border bg-muted/40 p-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-sm shadow-sm">
                    💡
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
              {/* Preview */}
              <div className="overflow-hidden rounded-xl border bg-muted/20">
                <img
                  src={previewUrl}
                  alt="Selected garment preview"
                  className="mx-auto max-h-[420px] w-full object-contain"
                />
              </div>

              {/* File Info */}
              {selectedFile && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border bg-muted/40 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{selectedFile.name}</p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    Ready
                  </span>
                </div>
              )}

              {/* Photo Feedback */}
              {feedback && (
                <div className="mt-4 rounded-xl border bg-muted/40 p-4">
                  <div className="flex gap-3">
                    <span className="text-base">💡</span>

                    <p className="text-sm leading-5 text-muted-foreground">{feedback}</p>
                  </div>
                </div>
              )}

              {/* Change Photo */}
              <Button
                type="button"
                variant="outline"
                onClick={clearSelection}
                disabled={uploadStatus === 'uploading'}
                className="mt-4 w-full cursor-pointer rounded-xl"
              >
                Choose another photo
              </Button>
            </>
          )}

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
            >
              <p className="font-semibold">Upload issue</p>

              <p className="mt-1 leading-5">{error}</p>

              {uploadStatus === 'error' && selectedFile && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUpload}
                  className="mt-3 cursor-pointer rounded-lg"
                >
                  Try again
                </Button>
              )}
            </div>
          )}

          {/* Success */}
          {uploadStatus === 'success' && (
            <div
              role="status"
              className="mt-4 rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-700"
            >
              <p className="font-semibold">Upload successful</p>

              <p className="mt-1 leading-5">Your wardrobe item is ready to be processed.</p>
            </div>
          )}

          {/* Upload */}
          {previewUrl && uploadStatus !== 'success' && (
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || uploadStatus === 'uploading'}
              className="mt-4 h-11 w-full cursor-pointer rounded-xl text-sm font-semibold"
            >
              {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload garment'}
            </Button>
          )}
        </div>

        <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
          Your photo will be uploaded securely for wardrobe processing.
        </p>
      </section>
    </main>
  );
}

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { server } from '@/test/server';

import ItemCapture from './ItemCapture';
import { getColorConfidence } from './color-confidence';

beforeAll(() => {
  Object.defineProperty(URL, 'createObjectURL', {
    writable: true,
    value: vi.fn(() => 'blob:mock-preview'),
  });

  Object.defineProperty(URL, 'revokeObjectURL', {
    writable: true,
    value: vi.fn(),
  });
});

const BASE = '*/v1';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('./color-confidence', () => ({
  getColorConfidence: vi.fn(() => 0.92),
}));

function createImageFile(name = 'shirt.jpg', type = 'image/jpeg', size = 200 * 1024) {
  return new File([new Uint8Array(size)], name, { type });
}

function getFileInput() {
  return document.querySelector('input[type="file"]') as HTMLInputElement;
}

describe('ItemCapture', () => {
  beforeEach(() => {
    vi.mocked(getColorConfidence).mockReturnValue(0.92);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    server.resetHandlers();
  });

  it('shows an error for an invalid file type', async () => {
    render(<ItemCapture />);

    const input = getFileInput();
    const file = createImageFile('shirt.pdf', 'application/pdf');

    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(await screen.findByText('Please choose a JPG, PNG, or WebP image.')).toBeInTheDocument();

    expect(screen.getByText('Upload issue')).toBeInTheDocument();
  });

  it('shows an error when the image is oversized', async () => {
    render(<ItemCapture />);

    const input = getFileInput();
    const file = createImageFile('large-shirt.jpg', 'image/jpeg', 10 * 1024 * 1024 + 1);

    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(await screen.findByText('Image must be smaller than 10 MB.')).toBeInTheDocument();

    expect(screen.getByText('Upload issue')).toBeInTheDocument();
  });

  it('shows the COLOR_LOW_CONFIDENCE error', async () => {
    vi.mocked(getColorConfidence).mockReturnValue(0.4);

    render(<ItemCapture />);

    const input = getFileInput();
    const file = createImageFile();

    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(screen.getByRole('button', { name: 'Upload garment' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Upload garment' }));

    expect(
      await screen.findByText(
        'We could not confidently identify the colour. Please retake the photo or correct the colour manually.',
      ),
    ).toBeInTheDocument();

    expect(screen.getByText('Upload issue')).toBeInTheDocument();
  });

  it('shows the upload failure returned by the API', async () => {
    server.use(
      http.post(`${BASE}/wardrobe/uploads/sessions`, () => {
        return HttpResponse.json(
          {
            error: {
              code: 'UPLOAD_FAILED',
              message: 'The upload service is temporarily unavailable.',
              correlation_id: crypto.randomUUID(),
              details: {
                retryable: true,
              },
            },
          },
          { status: 500 },
        );
      }),
    );

    render(<ItemCapture />);

    const input = getFileInput();
    const file = createImageFile();

    fireEvent.change(input, {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Upload garment' }));

    await waitFor(() => {
      expect(
        screen.getByText('The upload service is temporarily unavailable.'),
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Upload issue')).toBeInTheDocument();
  });
});

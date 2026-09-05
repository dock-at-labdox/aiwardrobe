import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';

import { afterEach, describe, expect, it } from 'vitest';

import WardrobeList from './WardrobeList';
import { server } from '@/test/server';

const BASE = '*/v1';

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({ count }: { count: number }) => ({
    getTotalSize: () => count * 770,
    getVirtualItems: () =>
      Array.from({ length: count }, (_, index) => ({
        index,
        start: index * 770,
        size: 770,
        key: index,
      })),
    scrollToIndex: vi.fn(),
  }),
}));

describe('WardrobeList', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('shows the loading state', () => {
    server.use(
      http.get(`${BASE}/wardrobe/items`, async () => {
        await new Promise(() => {});
      }),
    );

    render(<WardrobeList />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading your wardrobe...');
  });

  it('shows the empty state', async () => {
    server.use(
      http.get(`${BASE}/wardrobe/items`, () => {
        return HttpResponse.json({ items: [] });
      }),
    );

    render(<WardrobeList />);

    expect(
      await screen.findByText('Add your first item to start building your wardrobe.'),
    ).toBeInTheDocument();
  });

  it('shows the exact API error message', async () => {
    server.use(
      http.get(`${BASE}/wardrobe/items`, () => {
        return HttpResponse.json(
          {
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Something went wrong on our side.',
              correlation_id: crypto.randomUUID(),
              details: { retryable: true },
            },
          },
          { status: 500 },
        );
      }),
    );

    render(<WardrobeList />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong on our side.');
  });

  it('renders wardrobe items and filters by category', async () => {
    render(<WardrobeList />);

    expect(await screen.findByText('Navy Blazer')).toBeInTheDocument();

    const allButtons = screen.getAllByRole('button');
    expect(allButtons.some((button) => button.textContent === 'All')).toBe(true);

    const topsButton = screen.getByRole('button', { name: 'Tops' });
    fireEvent.click(topsButton);

    await waitFor(() => {
      expect(screen.getByText('White Oxford Shirt')).toBeInTheDocument();
      expect(screen.queryByText('Navy Blazer')).not.toBeInTheDocument();
    });
  });
});

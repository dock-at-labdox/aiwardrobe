import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import ModerationPage from './page';

const getMock = vi.fn();

vi.mock('@aiwardrobe/shared-web', () => ({
  ApiClient: vi.fn().mockImplementation(() => ({
    get: getMock,
  })),
  AsyncState: ({
    loading,
    error,
    empty,
    loadingMessage,
    emptyMessage,
    children,
  }: {
    loading: boolean;
    error: unknown;
    empty: boolean;
    loadingMessage: string;
    emptyMessage: string;
    children: React.ReactNode;
  }) => {
    if (loading) return <div>{loadingMessage}</div>;
    if (error) return <div role="alert">Failed to load moderation queue.</div>;
    if (empty) return <div>{emptyMessage}</div>;
    return <>{children}</>;
  },
}));

describe('ModerationPage', () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it('shows the loading state', () => {
    getMock.mockReturnValue(new Promise(() => undefined));

    render(<ModerationPage />);

    expect(screen.getByText('Loading moderation queue...')).toBeInTheDocument();
  });

  it('shows the error state', async () => {
    getMock.mockRejectedValue(new Error('Request failed'));

    render(<ModerationPage />);

    const alert = await screen.findByRole('alert');

    expect(alert).toHaveTextContent('Failed to load moderation queue.');
  });

  it('shows the empty state', async () => {
    getMock.mockResolvedValue({ items: [] });

    render(<ModerationPage />);

    expect(await screen.findByText('No moderation items found.')).toBeInTheDocument();
  });

  it('renders moderation items and distinguishes flagged items', async () => {
    getMock.mockResolvedValue({
      items: [
        {
          id: 'pending-1',
          type: 'USER_REPORT',
          status: 'PENDING',
          description: 'Pending report',
        },
        {
          id: 'flagged-1',
          type: 'IMAGE',
          status: 'FLAGGED',
          description: 'Flagged image',
        },
      ],
    });

    render(<ModerationPage />);

    expect(await screen.findByText('Pending report')).toBeInTheDocument();
    expect(screen.getByText('Flagged image')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('[!] Flagged')).toBeInTheDocument();

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith('/v1/admin/moderation/queue');
    });
  });
});

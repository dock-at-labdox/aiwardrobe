import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import SupportPage from './page';

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
    if (error) return <div role="alert">Failed to load support users.</div>;
    if (empty) return <div>{emptyMessage}</div>;
    return <>{children}</>;
  },
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

describe('SupportPage', () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it('shows the loading state', () => {
    getMock.mockReturnValue(new Promise(() => undefined));

    render(<SupportPage />);

    expect(screen.getByText('Loading support users...')).toBeInTheDocument();
  });

  it('shows the error state', async () => {
    getMock.mockRejectedValue(new Error('Request failed'));

    render(<SupportPage />);

    const alert = await screen.findByRole('alert');

    expect(alert).toHaveTextContent('Failed to load support users.');
  });

  it('shows the empty state', async () => {
    getMock.mockResolvedValue({ users: [] });

    render(<SupportPage />);

    expect(await screen.findByText('No users found.')).toBeInTheDocument();
  });

  it('renders users and dashboard navigation', async () => {
    getMock.mockResolvedValue({
      users: [
        {
          id: 'user-1',
          email: 'user@example.com',
        },
      ],
    });

    render(<SupportPage />);

    expect(await screen.findByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText('user-1')).toBeInTheDocument();

    const dashboardLink = screen.getByRole('link', { name: 'Back to Dashboard' });
    expect(dashboardLink).toHaveAttribute('href', '/');

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith('/v1/admin/support/users');
    });
  });
});

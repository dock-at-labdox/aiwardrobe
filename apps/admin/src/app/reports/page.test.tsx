import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import ReportsPage from './page';

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
    if (error) return <div role="alert">Failed to load operational report.</div>;
    if (empty) return <div>{emptyMessage}</div>;
    return <>{children}</>;
  },
}));

describe('ReportsPage', () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it('shows the loading state', () => {
    getMock.mockReturnValue(new Promise(() => undefined));

    render(<ReportsPage />);

    expect(screen.getByText('Loading operational report...')).toBeInTheDocument();
  });

  it('shows the error state', async () => {
    getMock.mockRejectedValue(new Error('Request failed'));

    render(<ReportsPage />);

    const alert = await screen.findByRole('alert');

    expect(alert).toHaveTextContent('Failed to load operational report.');
  });

  it('shows the empty state', async () => {
    getMock.mockResolvedValue(null);

    render(<ReportsPage />);

    expect(await screen.findByText('No report data available.')).toBeInTheDocument();
  });

  it('renders operational metrics', async () => {
    getMock.mockResolvedValue({
      totalUsers: 120,
      activeUsers: 85,
      wardrobeItems: 340,
      moderationPending: 7,
    });

    render(<ReportsPage />);

    expect(await screen.findByText('120')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('340')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('Wardrobe Items')).toBeInTheDocument();
    expect(screen.getByText('Pending Moderation')).toBeInTheDocument();

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith('/v1/admin/reports/overview');
    });
  });
});

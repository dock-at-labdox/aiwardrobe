import { ReactNode } from 'react';

export interface AsyncStateProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  loadingMessage?: string;
  errorMessage?: string;
  emptyMessage?: string;
  children: ReactNode;
}

export function AsyncState({
  loading = false,
  error = null,
  empty = false,
  loadingMessage = 'Loading...',
  errorMessage = 'Something went wrong.',
  emptyMessage = 'No data available.',
  children,
}: AsyncStateProps) {
  if (loading) {
    return (
      <section role="status" aria-live="polite">
        {loadingMessage}
      </section>
    );
  }

  if (error) {
    return <section role="alert">{error || errorMessage}</section>;
  }

  if (empty) {
    return <section>{emptyMessage}</section>;
  }

  return <section>{children}</section>;
}

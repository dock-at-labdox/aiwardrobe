'use client';

export default function RootError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main role="alert">
      <p>Something went wrong.</p>
      <button onClick={reset}>Try again</button>
    </main>
  );
}

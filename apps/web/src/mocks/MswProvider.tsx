'use client';

import { useEffect, useState } from 'react';

const SHOULD_MOCK = process.env.NEXT_PUBLIC_API_MOCKING === 'enabled';

let started = false;

// Mocking is opt-in via NEXT_PUBLIC_API_MOCKING=enabled, so we can turn it on
// for the deployed demo and off once real endpoints land.
export default function MswProvider({ children }: { children: React.ReactNode }) {
  // Starts ready when mocking is off, so the app renders straight away.
  const [ready, setReady] = useState(!SHOULD_MOCK || started);

  useEffect(() => {
    if (!SHOULD_MOCK || started) return;

    started = true;

    import('./browser').then(({ worker }) => {
      worker.start({ onUnhandledRequest: 'bypass' }).then(() => setReady(true));
    });
  }, []);

  if (!ready) return null;

  return <>{children}</>;
}

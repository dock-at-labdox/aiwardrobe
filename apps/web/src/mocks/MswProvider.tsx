'use client';

import { useEffect, useState } from 'react';

let started = false;

export default function MswProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const shouldMock =
      process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_API_MOCKING !== 'disabled';

    if (!shouldMock || started) {
      return;
    }

    started = true;

    import('./browser').then(({ worker }) => {
      worker.start({ onUnhandledRequest: 'bypass' }).then(() => setReady(true));
    });
  }, []);

  if (!ready && process.env.NODE_ENV === 'development') return null;

  return <>{children}</>;
}

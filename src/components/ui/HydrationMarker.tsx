'use client';

import { useEffect } from 'react';

/** Sets html[data-hydrated] once React has hydrated (lets e2e tests wait for interactivity). */
export function HydrationMarker() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = '';
  }, []);
  return null;
}

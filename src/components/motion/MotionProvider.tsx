'use client';

import { LazyMotion, MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';
import type features from './motion-features';
import { EASE, DURATION } from '@/lib/motion-tokens';

type Features = typeof features;

/**
 * Motion features (domMax: layout/shared-element + drag) are fetched after the page is idle,
 * so they stay off the critical path; `m.*` components render plainly until then.
 */
const loadFeatures = () =>
  new Promise<Features>((resolve) => {
    const load = () => import('./motion-features').then((mod) => resolve(mod.default));
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(load, { timeout: 1500 });
    else window.setTimeout(load, 300);
  });

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: DURATION.base, ease: EASE }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}

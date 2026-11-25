'use client';

import { LazyMotion, MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';
import { EASE, DURATION } from '@/lib/motion-tokens';

// Layout/shared-element features (domMax) load after first paint to keep the initial bundle small.
const loadFeatures = () => import('./motion-features').then((mod) => mod.default);

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: DURATION.base, ease: EASE }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}

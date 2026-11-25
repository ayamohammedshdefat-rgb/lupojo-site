'use client';

import { domAnimation, LazyMotion, MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';
import { EASE, DURATION } from '@/lib/motion-tokens';

/**
 * Motion for lazily loaded surfaces only (rating sheet, admin). Public pages stay library-free
 * to keep the first-load budget; see docs/brand-tokens.md#motion.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: DURATION.base, ease: EASE }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}

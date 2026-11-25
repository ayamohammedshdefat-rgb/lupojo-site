'use client';

import { Flame } from 'lucide-react';
import { m } from 'motion/react';
import { useMemo } from 'react';

const SPARKS = 14;

/** Submit success: the stars burst into sparks, a checkmark draws itself, a flame glows. */
export function SuccessBurst() {
  const sparks = useMemo(
    () =>
      Array.from({ length: SPARKS }, (_, i) => {
        const angle = (i / SPARKS) * Math.PI * 2 + (i % 2) * 0.2;
        const dist = 64 + (i % 3) * 22;
        return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, d: 0.05 * (i % 4), s: 0.6 + (i % 3) * 0.25 };
      }),
    [],
  );

  return (
    <div className="relative mx-auto flex size-40 items-center justify-center" aria-hidden="true">
      <div className="glow-accent absolute inset-0 rounded-full opacity-70" />
      {sparks.map((p, i) => (
        <m.span
          key={i}
          className="absolute size-2 rounded-full bg-gold shadow-[0_0_10px_rgb(255_194_61/0.9)]"
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{ x: p.x, y: p.y + 18, scale: [0, p.s * 1.4, 0], opacity: [1, 1, 0] }}
          transition={{ duration: 0.9, delay: p.d, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
      <m.svg
        viewBox="0 0 52 52"
        className="relative size-20 text-success"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
      >
        <m.circle
          cx="26"
          cy="26"
          r="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        <m.path
          d="M15 27 l7 7 l15 -16"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
      </m.svg>
      <m.span
        className="absolute -bottom-1 text-gold"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <Flame size={28} strokeWidth={1.75} fill="currentColor" />
      </m.span>
    </div>
  );
}

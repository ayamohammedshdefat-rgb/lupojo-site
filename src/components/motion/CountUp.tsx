'use client';

import { useLayoutEffect, useRef } from 'react';
import { formatInt, formatRating } from '@/lib/format';

type CountUpProps = { value: number; kind?: 'rating' | 'int'; className?: string; duration?: number };

/**
 * Number that counts up when it scrolls into view. The server renders the final value
 * (correct without JS); the client resets to zero before paint and animates on enter.
 * Cairo's equal-width digits keep it from jittering.
 */
export function CountUp({ value, kind = 'int', className, duration = 0.9 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = kind === 'rating' ? formatRating : (n: number) => formatInt(Math.round(n));

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.textContent = fmt(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - t0) / (duration * 1000));
          const eased = 1 - Math.pow(1 - t, 4); // ease-out, close to [0.16, 1, 0.3, 1]
          el.textContent = fmt(value * eased);
          if (t < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = fmt(value);
    };
    // fmt is derived from `kind`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, kind, duration]);

  return (
    <span ref={ref} className={className}>
      {fmt(value)}
    </span>
  );
}

'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Subtle pointer tilt for the hero's featured item (desktop pointers only, CSS-variable driven). */
export function HeroTilt({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const section = el.closest('section');
    if (!section) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = el.getBoundingClientRect();
        const nx = Math.max(-0.5, Math.min(0.5, (e.clientX - (r.left + r.width / 2)) / (r.width * 1.6)));
        const ny = Math.max(-0.5, Math.min(0.5, (e.clientY - (r.top + r.height / 2)) / (r.height * 1.6)));
        el.style.setProperty('--ry', `${(nx * 14).toFixed(2)}deg`);
        el.style.setProperty('--rx', `${(-ny * 12).toFixed(2)}deg`);
      });
    };
    const onLeave = () => {
      el.style.setProperty('--ry', '0deg');
      el.style.setProperty('--rx', '0deg');
    };
    section.addEventListener('pointermove', onMove);
    section.addEventListener('pointerleave', onLeave);
    return () => {
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={`lupo-tilt ${className}`}>
      {children}
    </div>
  );
}

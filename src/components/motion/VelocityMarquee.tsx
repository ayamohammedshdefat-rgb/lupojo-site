'use client';

import { useEffect, useRef } from 'react';

/**
 * Giant outlined English word that drifts sideways; its speed follows the scroll velocity and it
 * reverses when scrolling up. rAF only while on screen; static under reduced motion.
 */
export function VelocityMarquee({ text, baseSpeed = 1.2 }: { text: string; baseSpeed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    const track = trackRef.current;
    if (!root || !track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let x = 0; // percent of the track (4 copies -> wraps every 25%)
    let dir = 1;
    let velocity = 0; // smoothed px/ms
    let lastY = window.scrollY;
    let lastT = performance.now();
    let raf = 0;
    let running = false;

    const tick = (now: number) => {
      const dt = Math.min(64, now - lastT);
      lastT = now;
      const y = window.scrollY;
      const instant = (y - lastY) / Math.max(1, dt);
      lastY = y;
      velocity += (instant - velocity) * 0.12;
      if (Math.abs(velocity) > 0.02) dir = velocity > 0 ? 1 : -1;
      const boost = 1 + Math.min(6, Math.abs(velocity) * 4);
      x -= dir * baseSpeed * boost * (dt / 1000);
      x = ((x % 25) - 25) % 25;
      track.style.transform = `translate3d(${x}%, 0, 0)`;
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      const vis = !!e?.isIntersecting;
      if (vis && !running) {
        running = true;
        lastT = performance.now();
        lastY = window.scrollY;
        raf = requestAnimationFrame(tick);
      } else if (!vis && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    }, { rootMargin: '80px' });
    io.observe(root);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [baseSpeed]);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none overflow-hidden" dir="ltr">
      <div ref={trackRef} className="flex w-max whitespace-nowrap will-change-transform">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            lang="en"
            className="lupo-outline-word block pe-[0.4em] text-[72px] leading-display font-black uppercase sm:text-[104px] lg:text-[128px]"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

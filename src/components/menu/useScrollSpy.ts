'use client';

import { useEffect, useState } from 'react';

/** Distance from the viewport top where a section becomes "current" (below the sticky bars). */
const BAND = 150;

/**
 * Returns the id of the section currently being read: the last section whose top has
 * crossed the band just below the sticky header + chips. rAF-throttled, passive listener.
 */
export function useScrollSpy(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  const key = ids.join('|');

  useEffect(() => {
    const list = key.split('|').filter(Boolean);
    let frame = 0;
    const update = () => {
      frame = 0;
      let current: string | null = list[0] ?? null;
      for (const id of list) {
        const el = document.getElementById(id);
        if (!el || el.hidden) continue;
        if (el.getBoundingClientRect().top - BAND <= 0) current = id;
      }
      // At the very bottom, the last section is current even if it is short.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        const last = [...list].reverse().find((id) => !document.getElementById(id)?.hidden);
        if (last) current = last;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [key]);

  return active;
}

'use client';

import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ar } from '@/i18n/ar';

/** Floating "back to top" button, shown after scrolling past ~1.5 viewports. */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setShow(window.scrollY > window.innerHeight * 1.5);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      }}
      aria-label={ar.common.backToTop}
      aria-hidden={show ? undefined : true}
      tabIndex={show ? undefined : -1}
      data-show={show ? '' : undefined}
      className="lupo-pop glass-strong fixed end-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 flex size-12 items-center justify-center rounded-full text-fg shadow-card active:scale-90 lg:end-8 lg:bottom-8"
    >
      <ArrowUp size={22} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}

'use client';

import { ArrowUp } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useEffect, useState } from 'react';
import { ar } from '@/i18n/ar';
import { SPRING_UI } from '@/lib/motion-tokens';

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
    <AnimatePresence>
      {show && (
        <m.button
          type="button"
          key="top"
          initial={{ opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 12 }}
          transition={SPRING_UI}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
          }}
          aria-label={ar.common.backToTop}
          className="glass-strong fixed end-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 flex size-12 items-center justify-center rounded-full text-fg shadow-card lg:end-8 lg:bottom-8"
        >
          <ArrowUp size={22} strokeWidth={1.75} aria-hidden="true" />
        </m.button>
      )}
    </AnimatePresence>
  );
}

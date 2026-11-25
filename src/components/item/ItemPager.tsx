'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { ar } from '@/i18n/ar';

type Neighbor = { slug: string; nameAr: string } | null;

function isRtl() {
  return document.documentElement.dir === 'rtl';
}

/**
 * Previous/next item in the same section. Arrow keys and swipes follow reading direction:
 * in RTL, ArrowLeft / swipe toward the right edge moves to the NEXT item.
 * `replace` keeps history flat, so Back closes the detail instead of stepping through items.
 */
function usePagerNav(prev: Neighbor, next: Neighbor) {
  const router = useRouter();
  const go = (n: Neighbor) => n && router.replace(`/item/${n.slug}`, { scroll: false });
  return { goPrev: () => go(prev), goNext: () => go(next) };
}

/** Arrow-key paging; mounted once per detail view (inside PagerButtons). */
function usePagerKeys(prev: Neighbor, next: Neighbor) {
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const forward = (e.key === 'ArrowLeft') === isRtl();
      const target = forward ? next : prev;
      if (target) {
        e.preventDefault();
        router.replace(`/item/${target.slug}`, { scroll: false });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next, router]);
}

/** Horizontal swipe area (touch). Vertical scrolling is untouched. */
export function SwipeArea({ prev, next, children }: { prev: Neighbor; next: Neighbor; children: ReactNode }) {
  const { goPrev, goNext } = usePagerNav(prev, next);
  const start = useRef<{ x: number; y: number } | null>(null);
  return (
    <div
      onTouchStart={(e) => {
        const t = e.touches[0];
        start.current = t ? { x: t.clientX, y: t.clientY } : null;
      }}
      onTouchEnd={(e) => {
        const s = start.current;
        const t = e.changedTouches[0];
        start.current = null;
        if (!s || !t) return;
        const dx = t.clientX - s.x;
        const dy = t.clientY - s.y;
        if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
        // RTL: dragging content toward the right edge reveals the next item.
        const forward = dx > 0 === isRtl();
        if (forward) goNext();
        else goPrev();
      }}
    >
      {children}
    </div>
  );
}

/** Previous/next buttons. Chevrons mirror in RTL (they point along reading direction). */
export function PagerButtons({ prev, next }: { prev: Neighbor; next: Neighbor }) {
  const { goPrev, goNext } = usePagerNav(prev, next);
  usePagerKeys(prev, next);
  const btn =
    'glass flex size-11 items-center justify-center rounded-full text-fg transition-colors hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30';
  return (
    <div className="flex items-center gap-2">
      <button type="button" className={btn} onClick={goPrev} disabled={!prev} aria-label={prev ? `${ar.common.previous}: ${prev.nameAr}` : ar.common.previous}>
        <ChevronLeft size={20} strokeWidth={1.75} className="rtl:-scale-x-100" aria-hidden="true" />
      </button>
      <button type="button" className={btn} onClick={goNext} disabled={!next} aria-label={next ? `${ar.common.next}: ${next.nameAr}` : ar.common.next}>
        <ChevronRight size={20} strokeWidth={1.75} className="rtl:-scale-x-100" aria-hidden="true" />
      </button>
    </div>
  );
}

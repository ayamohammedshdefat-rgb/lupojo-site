'use client';

import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { ar } from '@/i18n/ar';
import { hasFreshSource, MODAL_CLOSING_EVENT } from '@/components/motion/shared-element';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
const EXIT_MS = 300;

/**
 * Intercepted-route modal shell: bottom sheet (drag the handle down to dismiss) below 768px,
 * centered dialog above. Esc, backdrop, close button and drag play the exit animation, then
 * router.back(). Focus is trapped and restored; page scroll is locked via html[data-modal-open].
 * Rendered by a layout above [slug], so it stays mounted while the user pages between items.
 * Motion is CSS + Web Animations only (no animation library on the public critical path).
 */
export function ItemModal({ children }: { children: ReactNode }) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const drag = useRef<{ start: number; last: number; t: number; v: number; dy: number } | null>(null);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      router.back();
      return;
    }
    window.dispatchEvent(new Event(MODAL_CLOSING_EVENT));
    if (rootRef.current) rootRef.current.dataset.state = 'closing';
    window.setTimeout(() => router.back(), EXIT_MS);
  }, [router]);

  // Runs on mount AND every time Activity reveals a preserved (hidden) modal: reset the shell.
  // State lives on DOM attributes, so a modal hidden mid-exit never comes back half-closed.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    closing.current = false;
    root.dataset.state = 'open';
    // Entry: fade when a card is about to fly in, otherwise the sheet slides up.
    root.dataset.entry = hasFreshSource(window.location.pathname.split('/').pop() ?? '') ? 'fade' : 'slide';
    panelRef.current?.style.removeProperty('transform');
    panelRef.current?.style.removeProperty('transition');
  }, []);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    html.dataset.modalOpen = 'true';
    const gap = window.innerWidth - html.clientWidth;
    if (gap > 0) html.style.setProperty('--scrollbar-gap', `${gap}px`);
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      delete html.dataset.modalOpen;
      html.style.removeProperty('--scrollbar-gap');
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== 'Tab' || !panelRef.current) return;
    const nodes = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null);
    const first = nodes[0];
    const last = nodes.at(-1);
    if (!first || !last) return;
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // Sheet drag (handle only): follows the finger, dismisses past 140px or on a fast flick.
  const onHandleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!window.matchMedia('(max-width: 767.98px)').matches || !panelRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    panelRef.current.style.transition = 'none';
    drag.current = { start: e.clientY, last: e.clientY, t: e.timeStamp, v: 0, dy: 0 };
  };
  const onHandleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const panel = panelRef.current;
    if (!d || !panel) return;
    d.v = (e.clientY - d.last) / Math.max(1, e.timeStamp - d.t);
    d.last = e.clientY;
    d.t = e.timeStamp;
    const raw = e.clientY - d.start;
    d.dy = raw > 0 ? raw : raw * 0.15;
    panel.style.transform = `translateY(${d.dy}px)`;
  };
  const onHandleUp = () => {
    const d = drag.current;
    const panel = panelRef.current;
    drag.current = null;
    if (!d || !panel) return;
    panel.style.transition = '';
    if (d.dy > 140 || d.v > 0.7) {
      panel.style.transform = 'translateY(100%)';
      close();
    } else {
      panel.style.transform = '';
    }
  };

  return (
    <div
      ref={rootRef}
      className="lupo-modal fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6"
      data-state="open"
      onKeyDown={onKeyDown}
      suppressHydrationWarning
    >
      <div
        aria-hidden="true"
        className="lupo-modal__backdrop absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={close}
        data-modal-backdrop
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        data-item-modal
        className="lupo-modal__panel glass-strong relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[32px] shadow-card outline-none md:max-h-[88dvh] md:max-w-[1000px] md:rounded-[32px]"
      >
        <div
          aria-hidden="true"
          className="flex h-7 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing md:hidden"
          onPointerDown={onHandleDown}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}
          onPointerCancel={onHandleUp}
        >
          <span className="h-1.5 w-11 rounded-full bg-white/25" />
        </div>
        <button
          type="button"
          onClick={close}
          aria-label={ar.common.close}
          className="glass absolute end-4 top-8 z-10 flex size-11 items-center justify-center rounded-full text-fg transition-colors hover:bg-white/10 md:end-6 md:top-5"
        >
          <X size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>
        <div
          ref={scrollRef}
          data-modal-scroll
          className="overflow-y-auto overscroll-contain px-4 pt-1 pb-[calc(2rem+env(safe-area-inset-bottom))] md:px-8 md:pt-5 md:pb-8"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** Toolbar row at the top of the modal content; leaves room for the close button on the end side. */
export function ModalToolbar({ children }: { children: ReactNode }) {
  return <div className="mb-5 flex min-h-11 items-center gap-2 pe-14">{children}</div>;
}

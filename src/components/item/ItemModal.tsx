'use client';

import { X } from 'lucide-react';
import { m, useDragControls, type PanInfo } from 'motion/react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { ar } from '@/i18n/ar';
import { DURATION, EASE, SPRING_SOFT } from '@/lib/motion-tokens';
import { MODAL_TITLE_ID } from './modal-ids';

const SHEET_QUERY = '(max-width: 767.98px)';

function useIsSheet() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(SHEET_QUERY);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia(SHEET_QUERY).matches,
    () => true,
  );
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';


/**
 * Intercepted-route modal shell: bottom sheet (drag the handle down to dismiss) below 768px,
 * centered dialog above. Back button, Esc and backdrop close it (router.back). Focus is trapped and
 * restored to the opener; page scroll is locked via html[data-modal-open].
 * Rendered by a layout above [slug], so it stays mounted while the user pages between items.
 */
export function ItemModal({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isSheet = useIsSheet();
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const closing = useRef(false);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    router.back();
  }, [router]);

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

  // Paging to another item: re-arm close and start the new item at the top.
  useEffect(() => {
    closing.current = false;
    scrollRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

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

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 140 || info.velocity.y > 700) close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" onKeyDown={onKeyDown}>
      <m.div
        aria-hidden="true"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: DURATION.base, ease: EASE }}
        onClick={close}
        data-modal-backdrop
      />
      <m.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={MODAL_TITLE_ID}
        tabIndex={-1}
        data-item-modal
        className="glass-strong relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[32px] shadow-card outline-none md:max-h-[88dvh] md:max-w-[1000px] md:rounded-[32px]"
        initial={isSheet ? { y: '100%' } : { opacity: 0, scale: 0.96, y: 16 }}
        animate={isSheet ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
        exit={isSheet ? { y: '100%' } : { opacity: 0, scale: 0.96, y: 16 }}
        transition={isSheet ? { type: 'spring', stiffness: 380, damping: 38 } : SPRING_SOFT}
        drag={isSheet ? 'y' : false}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={onDragEnd}
      >
        <div
          aria-hidden="true"
          className="flex h-7 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing md:hidden"
          onPointerDown={(e) => dragControls.start(e)}
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
      </m.div>
    </div>
  );
}

/** Toolbar row at the top of the modal content; leaves room for the close button on the end side. */
export function ModalToolbar({ children }: { children: ReactNode }) {
  return <div className="mb-5 flex min-h-11 items-center gap-2 pe-14">{children}</div>;
}

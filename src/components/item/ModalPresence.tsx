'use client';

import { AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Wraps the @modal slot so the sheet/dialog can play its exit animation after router.back()
 * (the slot's content is already `default` by then; AnimatePresence keeps the old tree mounted).
 * Keyed by "is an item route", not by slug, so prev/next swaps reuse the open modal.
 */
export function ModalPresence({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const open = pathname.startsWith('/item/');
  return <AnimatePresence>{open ? <div key="item-modal">{children}</div> : null}</AnimatePresence>;
}

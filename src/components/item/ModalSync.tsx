'use client';

import { useLayoutEffect, useRef } from 'react';

/**
 * Rendered with each item's content inside the modal: names the dialog after the visible item
 * (aria-labelledby) and starts a newly paged item at the top. Keeps the shell free of URL reads,
 * so it stays a static, instant part of the page.
 */
export function ModalSync({ titleId }: { titleId: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const dialog = ref.current?.closest('[role="dialog"]');
    if (!dialog) return;
    dialog.setAttribute('aria-labelledby', titleId);
    dialog.querySelector('[data-modal-scroll]')?.scrollTo({ top: 0 });
  }, [titleId]);
  return <span ref={ref} hidden />;
}

'use client';

import { Share2 } from 'lucide-react';
import { ar } from '@/i18n/ar';
import { toast } from '@/components/ui/toast';

/** Web Share API with a copy-link fallback. */
export function ShareButton({ title, path, className = '' }: { title: string; path: string; className?: string }) {
  return (
    <button
      type="button"
      aria-label={ar.common.share}
      className={`glass flex size-11 items-center justify-center rounded-full text-fg transition-colors hover:bg-white/10 ${className}`}
      onClick={async () => {
        const url = new URL(path, window.location.origin).toString();
        if (navigator.share) {
          try {
            await navigator.share({ title, url });
            return;
          } catch (err) {
            if ((err as DOMException).name === 'AbortError') return;
          }
        }
        try {
          await navigator.clipboard.writeText(url);
          toast(ar.common.copied, 'success');
        } catch {
          toast(url, 'info');
        }
      }}
    >
      <Share2 size={20} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}

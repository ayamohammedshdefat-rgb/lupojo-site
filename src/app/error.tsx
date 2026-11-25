'use client';

import { RotateCcw } from 'lucide-react';
import { useEffect } from 'react';
import { DroppedBurger } from '@/components/ui/DroppedBurger';
import { ar } from '@/i18n/ar';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error.digest ?? error.message);
  }, [error]);

  return (
    <DroppedBurger
      title={ar.errors.errorTitle}
      body={ar.errors.errorBody}
      action={
        <button
          type="button"
          onClick={reset}
          className="glass inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-base leading-ui font-semibold text-fg hover:bg-white/10"
        >
          <RotateCcw size={18} strokeWidth={2} aria-hidden="true" />
          {ar.common.retry}
        </button>
      }
    />
  );
}

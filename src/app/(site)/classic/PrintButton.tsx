'use client';

import type { ReactNode } from 'react';
import { ar } from '@/i18n/ar';

export function PrintButton({ icon }: { icon: ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="glass inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm leading-ui font-semibold text-fg hover:bg-white/10"
    >
      {icon}
      {ar.common.print}
    </button>
  );
}

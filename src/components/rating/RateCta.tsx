'use client';

import { Clock, Star } from 'lucide-react';
import { ar } from '@/i18n/ar';

type RateCtaProps = { itemId: string; itemName: string; unavailable: boolean };

/** "قيّم هذا الصنف". Disabled (with the reason) when the item is unavailable. */
export function RateCta({ unavailable }: RateCtaProps) {
  if (unavailable) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled
          aria-describedby="rate-disabled-reason"
          className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-surface-3 px-6 text-base leading-ui font-semibold text-muted"
        >
          <Star size={20} strokeWidth={1.75} aria-hidden="true" />
          {ar.item.rate}
        </button>
        <p id="rate-disabled-reason" className="flex items-center justify-center gap-1.5 text-xs leading-ui text-muted">
          <Clock size={14} strokeWidth={2} aria-hidden="true" />
          {ar.item.rateDisabled}
        </p>
      </div>
    );
  }
  return (
    <button
      type="button"
      data-rate-button
      className="group flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-accent px-6 text-base leading-ui font-semibold text-canvas shadow-glow transition-[scale,background-color] duration-180 ease-lupo hover:bg-accent-hi active:scale-[0.97]"
    >
      <Star size={20} strokeWidth={1.75} className="transition-transform duration-320 group-hover:rotate-[72deg]" aria-hidden="true" />
      {ar.item.rate}
    </button>
  );
}

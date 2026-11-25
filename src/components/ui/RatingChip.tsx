import { Sparkles, Star } from 'lucide-react';
import { ar } from '@/i18n/ar';
import { formatInt, formatRating } from '@/lib/format';

/** "4.6 · 23" with a gold star, or "جديد" when the item has no ratings yet. */
export function RatingChip({ count, avg, className = '' }: { count: number; avg: number; className?: string }) {
  if (count === 0) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs leading-ui font-semibold text-muted ${className}`}>
        <Sparkles size={14} strokeWidth={2} className="text-accent-hi" aria-hidden="true" />
        {ar.item.new}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs leading-ui font-semibold text-fg ${className}`}
      aria-label={`التقييم ${formatRating(avg)} من 5، ${formatInt(count)}`}
    >
      <Star size={14} strokeWidth={2} fill="currentColor" className="text-gold" aria-hidden="true" />
      <span dir="ltr" className="tabular">
        {formatRating(avg)}
        <span className="mx-1 text-muted">·</span>
        <span className="font-cairo-light text-muted">{formatInt(count)}</span>
      </span>
    </span>
  );
}

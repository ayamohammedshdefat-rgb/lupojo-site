import { Star } from 'lucide-react';
import { Stars } from '@/components/ui/Stars';
import { formatInt, formatRating, formatRatingCount } from '@/lib/format';
import type { ItemStats, StarKey } from '@/types/menu';

const ROWS: StarKey[] = ['5', '4', '3', '2', '1'];

/** Big average (Cairo ExtraLight), stars, Arabic plural count and the 5-to-1 distribution. */
export function RatingSummary({ stats, avg }: { stats: ItemStats; avg: number }) {
  const max = Math.max(1, ...ROWS.map((k) => stats.dist[k]));
  return (
    <div className="glass grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5 rounded-card p-5" data-rating-summary>
      <div className="flex flex-col items-center gap-1 pe-1">
        <span
          dir="ltr"
          data-avg
          className="tabular font-cairo-extralight text-[64px] leading-display text-fg"
          aria-label={`متوسط التقييم ${formatRating(avg)} من 5`}
        >
          {formatRating(avg)}
        </span>
        <Stars value={avg} size={16} />
        <span data-count className="mt-1 text-xs leading-ui font-cairo-light text-muted">
          {formatRatingCount(stats.count)}
        </span>
      </div>
      <ul className="flex flex-col gap-1.5" aria-label="توزيع النجوم">
        {ROWS.map((k) => {
          const n = stats.dist[k];
          return (
            <li key={k} className="grid grid-cols-[1.75rem_minmax(0,1fr)_2rem] items-center gap-2 text-xs leading-ui">
              <span className="inline-flex items-center gap-0.5 font-semibold text-fg">
                {k}
                <Star size={12} strokeWidth={2} fill="currentColor" className="text-gold" aria-hidden="true" />
              </span>
              <span className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                <span
                  className="lupo-bar block h-full rounded-full bg-gradient-to-l from-gold to-accent-hi"
                  style={{ width: `${(n / max) * 100}%` }}
                />
              </span>
              <span className="tabular font-cairo-light text-end text-muted">{formatInt(n)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

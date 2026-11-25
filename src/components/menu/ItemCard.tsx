import Link from 'next/link';
import { ItemMedia } from '@/components/item/ItemMedia';
import { SharedSource } from '@/components/motion/shared-element';
import { ItemBadge, TopRatedBadge, UnavailableBadge } from '@/components/ui/Badges';
import { RatingChip } from '@/components/ui/RatingChip';
import { En } from '@/components/ui/En';
import { formatPriceList } from '@/lib/format';
import { ar } from '@/i18n/ar';
import type { MenuItem } from '@/types/menu';

export const CARD_SIZES = '(min-width: 1280px) 240px, (min-width: 1024px) 28vw, (min-width: 640px) 31vw, 46vw';

/** A real link to /item/[slug] (works without JS); intercepted into the modal when JS is on. */
export function ItemCard({ item, priority }: { item: MenuItem; priority?: boolean }) {
  const unavailable = item.availability === 'unavailable';
  return (
    <Link
      href={`/item/${item.slug}`}
      scroll={false}
      aria-label={ar.item.openDetails(item.nameAr)}
      data-item-card={item.slug}
      className={`group lupo-card glass relative isolate flex h-full flex-col rounded-card p-2 shadow-card transition-[translate,scale,background-color] duration-320 ease-lupo hover:-translate-y-1 hover:bg-white/[0.07] active:scale-[0.97] ${unavailable ? 'is-unavailable' : ''}`}
    >
      <div className={`relative ${unavailable ? 'grayscale' : ''}`}>
        <SharedSource kind="media">
          <ItemMedia item={item} sizes={CARD_SIZES} priority={priority} />
        </SharedSource>
        <div className="absolute inset-x-2 top-2 flex flex-wrap items-start gap-1">
          {unavailable && <UnavailableBadge />}
          {!unavailable && item.topRated && <TopRatedBadge />}
          {!unavailable && item.badges.slice(0, 1).map((b) => <ItemBadge key={b} badge={b} />)}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 px-2 pt-3 pb-2">
        <SharedSource kind="title" className="w-fit">
          <h3 className="text-[15px] leading-heading font-bold text-fg sm:text-base">{item.nameAr}</h3>
        </SharedSource>
        <En className="font-cairo-light text-[10px] leading-ui text-muted sm:text-[11px]">{item.nameEn}</En>
        {item.taglineAr && <p className="line-clamp-1 text-xs leading-ui text-muted">{item.taglineAr}</p>}
        <div className="mt-auto flex flex-col gap-1.5 pt-2">
          <RatingChip count={item.stats.count} avg={item.avg} />
          <span dir="ltr" className="tabular self-start text-sm leading-ui font-bold text-accent-hi sm:text-[15px]">
            {formatPriceList(item.prices.map((p) => p.amountFils))}
          </span>
        </div>
      </div>
    </Link>
  );
}

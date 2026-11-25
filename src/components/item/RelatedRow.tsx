import Link from 'next/link';
import { ItemMedia } from './ItemMedia';
import { ar } from '@/i18n/ar';
import { formatPriceList } from '@/lib/format';
import type { MenuItem } from '@/types/menu';

/** "قد يعجبك أيضًا": other visible items (hidden items never reach this list). */
export function RelatedRow({ items }: { items: MenuItem[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="related-title" className="flex flex-col gap-4">
      <h3 id="related-title" className="text-lg leading-heading font-bold text-fg">
        {ar.item.related}
      </h3>
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 md:-mx-8 md:scroll-px-8 md:px-8">
        {items.map((i) => (
          <li key={i.id} className="w-36 shrink-0 snap-start">
            <Link
              href={`/item/${i.slug}`}
              replace
              scroll={false}
              className="glass flex flex-col gap-2 rounded-[22px] p-1.5 transition-colors hover:bg-white/[0.08]"
              aria-label={ar.item.openDetails(i.nameAr)}
            >
              <ItemMedia item={i} sizes="144px" />
              <span className="truncate px-1.5 text-sm leading-ui font-semibold text-fg">{i.nameAr}</span>
              <span dir="ltr" className="tabular self-start px-1.5 pb-1 text-xs leading-ui font-bold text-accent-hi">
                {formatPriceList(i.prices.map((p) => p.amountFils))}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

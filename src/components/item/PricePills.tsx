import { En } from '@/components/ui/En';
import { formatJD } from '@/lib/format';
import type { PriceVariant } from '@/types/menu';

/** "ساندويش 2.75 JD" · "وجبة 3.50 JD". Informational only: there is no ordering. */
export function PricePills({ prices }: { prices: PriceVariant[] }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="الأسعار">
      {prices.map((p, i) => (
        <li
          key={`${p.labelAr ?? ''}-${i}`}
          className="glass flex min-h-12 items-center gap-3 rounded-[18px] py-2 ps-4 pe-3"
        >
          {(p.labelAr || p.labelEn) && (
            <span className="flex flex-col">
              {p.labelAr && <span className="text-sm leading-ui font-semibold text-fg">{p.labelAr}</span>}
              {p.labelEn && <En className="font-cairo-light text-[10px] leading-ui text-muted">{p.labelEn}</En>}
            </span>
          )}
          <span dir="ltr" className="tabular rounded-full bg-accent/15 px-3 py-1 text-base leading-ui font-bold text-accent-hi">
            {formatJD(p.amountFils)}
          </span>
        </li>
      ))}
    </ul>
  );
}

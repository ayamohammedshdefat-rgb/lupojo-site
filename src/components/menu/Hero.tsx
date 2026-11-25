import Link from 'next/link';
import { ChevronDown, Flame } from 'lucide-react';
import { ItemMedia } from '@/components/item/ItemMedia';
import { En } from '@/components/ui/En';
import { RatingChip } from '@/components/ui/RatingChip';
import { ar } from '@/i18n/ar';
import { formatPriceList } from '@/lib/format';
import type { MenuItem, SiteSettings } from '@/types/menu';

type HeroProps = { settings: SiteSettings; logoUrl: string; featured: MenuItem | null };

/**
 * Hero in the client's requested order: copy -> large logo -> (featured) -> chips.
 * Desktop splits into copy+logo on the start side and the featured item on the end side.
 */
export function Hero({ settings, logoUrl, featured }: HeroProps) {
  return (
    <section aria-label={settings.brandName} className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 mx-auto h-[620px] max-w-[1100px] bg-[radial-gradient(closest-side,rgb(227_111_18/0.22),transparent)]"
      />
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-4 pt-6 pb-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 lg:px-8 lg:pt-10 lg:pb-16">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-start">
          {settings.taglineEn && (
            <En as="p" className="text-[25px] leading-display font-black text-fg sm:text-4xl lg:text-[44px]">
              {settings.taglineEn}
            </En>
          )}
          {settings.subtaglineAr && (
            <p className="mt-3 text-[15px] leading-ar font-semibold text-fg/85 sm:text-lg">{settings.subtaglineAr}</p>
          )}
          {settings.subtaglineEn && (
            <En as="p" caps={false} className="font-cairo-light text-sm leading-ui text-muted">
              {settings.subtaglineEn}
            </En>
          )}
          <h1 className="mt-8 w-full lg:mt-10">
            {/* eslint-disable-next-line @next/next/no-img-element -- vector logo; it is the LCP element */}
            <img
              id="hero-logo"
              src={logoUrl}
              alt={settings.brandName}
              width={1376}
              height={404}
              fetchPriority="high"
              className="mx-auto h-auto w-[min(560px,90vw)] drop-shadow-[0_18px_30px_rgb(0_0_0/0.6)] lg:mx-0 lg:w-[min(600px,100%)]"
            />
          </h1>
          <a
            href="#menu"
            className="group mt-8 inline-flex flex-col items-center gap-1 text-sm leading-ui font-semibold text-muted transition-colors hover:text-fg max-lg:hidden"
          >
            {ar.menu.browse}
            <ChevronDown size={22} strokeWidth={1.75} className="animate-cue text-accent-hi" aria-hidden="true" />
          </a>
        </div>

        {featured && (
          <Link
            href={`/item/${featured.slug}`}
            scroll={false}
            className="group relative mx-auto block w-full max-w-[420px] lg:max-w-[500px]"
            aria-label={ar.item.openDetails(featured.nameAr)}
          >
            <div aria-hidden="true" className="glow-accent animate-breathe absolute -inset-[18%] -z-10 rounded-full blur-2xl" />
            <div className="animate-float">
              <div className="-rotate-2 shadow-float transition-transform duration-600 ease-lupo group-hover:rotate-0">
                <ItemMedia item={featured} variant="detail" sizes="(min-width: 1024px) 500px, 90vw" priority />
              </div>
            </div>
            <div className="glass-strong relative -mt-14 ms-auto me-4 flex w-[78%] items-center gap-3 rounded-[24px] p-3 ps-4 shadow-card">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="inline-flex items-center gap-1 text-[11px] leading-ui font-semibold text-gold">
                  <Flame size={14} strokeWidth={2} fill="currentColor" aria-hidden="true" />
                  {ar.item.featured}
                </span>
                <span className="truncate text-lg leading-heading font-bold text-fg">{featured.nameAr}</span>
                <En className="font-cairo-light truncate text-[10px] leading-ui text-muted">{featured.nameEn}</En>
              </div>
              <div className="flex flex-col items-end gap-1">
                <RatingChip count={featured.stats.count} avg={featured.avg} />
                <span dir="ltr" className="tabular text-sm leading-ui font-bold text-accent-hi">
                  {formatPriceList(featured.prices.map((p) => p.amountFils))}
                </span>
              </div>
            </div>
          </Link>
        )}

        <a
          href="#menu"
          className="mx-auto inline-flex flex-col items-center gap-1 text-sm leading-ui font-semibold text-muted lg:hidden"
        >
          {ar.menu.browse}
          <ChevronDown size={22} strokeWidth={1.75} className="animate-cue text-accent-hi" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

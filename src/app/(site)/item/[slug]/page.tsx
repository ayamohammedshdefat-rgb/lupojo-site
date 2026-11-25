import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ItemDetail } from '@/components/item/ItemDetail';
import { PagerButtons, SwipeArea } from '@/components/item/ItemPager';
import { ShareButton } from '@/components/item/ShareButton';
import { SiteFooter } from '@/components/menu/SiteFooter';
import { ar } from '@/i18n/ar';
import { DEFAULT_MARK, logoUrlOf } from '@/lib/brand';
import { formatPriceList } from '@/lib/format';
import { getPublicItem, getPublicItemSlugs, getSiteSettings } from '@/server/repos/menu';

/**
 * Visible items are prerendered (fast static deep links). Hidden/unknown slugs get their 404
 * status from the proxy (src/proxy.ts); notFound() here still renders the branded page.
 */
export const instant = false;

export async function generateStaticParams() {
  const slugs = await getPublicItemSlugs();
  // Cache Components needs at least one param; '__none' simply renders the 404.
  return (slugs.length ? slugs : ['__none']).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/item/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const ctx = await getPublicItem(slug);
  if (!ctx) return { title: 'LUPO' };
  const { item } = ctx;
  const description = [item.taglineAr, formatPriceList(item.prices.map((p) => p.amountFils))].filter(Boolean).join(' · ');
  return {
    title: `${item.nameAr} — ${item.nameEn} | LUPO`,
    description,
    alternates: { canonical: `/item/${item.slug}` },
    openGraph: {
      title: `${item.nameAr} — ${item.nameEn}`,
      description,
      images: item.image ? [{ url: item.image.url, width: item.image.width, height: item.image.height, alt: item.image.alt }] : undefined,
    },
  };
}

/** Full-page item detail for deep links, SEO and sharing. Hidden/unknown slugs return a real 404. */
export default async function ItemPage({ params }: PageProps<'/item/[slug]'>) {
  const { slug } = await params;
  const [ctx, settings] = await Promise.all([getPublicItem(slug), getSiteSettings()]);
  if (!ctx) notFound();
  const logoUrl = logoUrlOf(settings);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center gap-3 px-4 lg:px-8">
          <Link
            href="/"
            aria-label={ar.errors.backToMenu}
            className="glass inline-flex size-11 shrink-0 items-center justify-center gap-2 rounded-full text-sm leading-ui font-semibold text-fg hover:bg-white/10 sm:w-auto sm:ps-3 sm:pe-4"
          >
            <ArrowLeft size={18} strokeWidth={2} className="rtl:-scale-x-100" aria-hidden="true" />
            <span className="max-sm:hidden">{ar.errors.backToMenu}</span>
          </Link>
          <Link href="/" className="mx-auto" aria-label={settings.brandName}>
            {/* eslint-disable-next-line @next/next/no-img-element -- vector logo */}
            <img src={logoUrl} alt={settings.brandName} width={1376} height={404} className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <PagerButtons
              prev={ctx.prev && { slug: ctx.prev.slug, nameAr: ctx.prev.nameAr }}
              next={ctx.next && { slug: ctx.next.slug, nameAr: ctx.next.nameAr }}
            />
            <ShareButton title={ctx.item.nameAr} path={`/item/${ctx.item.slug}`} className="max-sm:hidden" />
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-[1100px] overflow-x-clip px-4 pt-8 pb-20 lg:px-8 lg:pt-12">
        <SwipeArea
          prev={ctx.prev && { slug: ctx.prev.slug, nameAr: ctx.prev.nameAr }}
          next={ctx.next && { slug: ctx.next.slug, nameAr: ctx.next.nameAr }}
        >
          <ItemDetail ctx={ctx} />
        </SwipeArea>
      </main>
      <SiteFooter settings={settings} markUrl={DEFAULT_MARK} />
    </>
  );
}

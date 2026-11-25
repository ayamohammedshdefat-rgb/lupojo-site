import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ItemDetail } from '@/components/item/ItemDetail';
import { ItemDetailSkeleton } from '@/components/item/ItemDetailSkeleton';
import { ModalToolbar } from '@/components/item/ItemModal';
import { PagerButtons, SwipeArea } from '@/components/item/ItemPager';
import { ShareButton } from '@/components/item/ShareButton';
import { getPublicItem, getPublicItemSlugs } from '@/server/repos/menu';

export async function generateStaticParams() {
  const slugs = await getPublicItemSlugs();
  return (slugs.length ? slugs : ['__none']).map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

async function ModalItem({ params }: Props) {
  const { slug } = await params;
  const ctx = await getPublicItem(slug);
  if (!ctx) notFound();
  const prev = ctx.prev && { slug: ctx.prev.slug, nameAr: ctx.prev.nameAr };
  const next = ctx.next && { slug: ctx.next.slug, nameAr: ctx.next.nameAr };
  return (
    <>
      <ModalToolbar>
        <PagerButtons prev={prev} next={next} />
        <ShareButton title={ctx.item.nameAr} path={`/item/${ctx.item.slug}`} />
      </ModalToolbar>
      <SwipeArea prev={prev} next={next}>
        <ItemDetail ctx={ctx} headingLevel="h2" />
      </SwipeArea>
    </>
  );
}

/** The same detail as /item/[slug], opened over the menu on client-side navigation. */
export default function ItemModalPage({ params }: Props) {
  return (
    <Suspense fallback={<ItemDetailSkeleton />}>
      <ModalItem params={params} />
    </Suspense>
  );
}

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ItemDetail } from '@/components/item/ItemDetail';
import { ItemDetailSkeleton } from '@/components/item/ItemDetailSkeleton';
import { ModalToolbar } from '@/components/item/ItemModal';
import { PagerButtons, SwipeArea } from '@/components/item/ItemPager';
import { ShareButton } from '@/components/item/ShareButton';
import { ModalSync } from '@/components/item/ModalSync';
import { modalTitleId } from '@/components/item/modal-ids';
import { getPublicItem } from '@/server/repos/menu';

// Not prerendered on purpose: a stale ISR entry for an interception route answers the first
// navigation after an owner edit with a 404 (the router then falls back to a full page load).
// The shell (layout) is static and instant; this content streams in behind the skeleton,
// reading the tag-cached menu.

type Props = { params: Promise<{ slug: string }> };

async function ModalItem({ params }: Props) {
  const { slug } = await params;
  const ctx = await getPublicItem(slug);
  if (!ctx) notFound();
  const prev = ctx.prev && { slug: ctx.prev.slug, nameAr: ctx.prev.nameAr };
  const next = ctx.next && { slug: ctx.next.slug, nameAr: ctx.next.nameAr };
  return (
    <>
      <ModalSync titleId={modalTitleId(ctx.item.slug)} />
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

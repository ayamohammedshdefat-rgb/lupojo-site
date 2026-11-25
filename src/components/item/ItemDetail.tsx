import { Flame } from 'lucide-react';
import { ItemMedia } from './ItemMedia';
import { PricePills } from './PricePills';
import { RatingSummary } from './RatingSummary';
import { ReviewsList } from './ReviewsList';
import { getApprovedComments } from '@/server/repos/reviews';
import { RelatedRow } from './RelatedRow';
import { modalTitleId } from './modal-ids';
import { SharedTarget } from '@/components/motion/shared-element';
import { ItemBadge, TopRatedBadge, UnavailableBadge } from '@/components/ui/Badges';
import { En } from '@/components/ui/En';
import { RateCta } from '@/components/rating/RateCta';
import { ar } from '@/i18n/ar';
import { formatInt } from '@/lib/format';
import type { ItemContext } from '@/types/menu';

/** Item detail shared by the modal/sheet and the full page. Only real content is shown: no placeholders. */
export async function ItemDetail({ ctx, headingLevel = 'h1' }: { ctx: ItemContext; headingLevel?: 'h1' | 'h2' }) {
  const { item } = ctx;
  const comments = await getApprovedComments(item.id);
  const unavailable = item.availability === 'unavailable';
  const Title = headingLevel;
  // In the modal (h2) the image and title are shared elements that fly in from the card.
  const shared = headingLevel === 'h2';

  return (
    <div className="flex flex-col gap-10" data-item-detail={item.slug}>
      <article className="grid gap-7 md:grid-cols-2 md:gap-10">
        <div className="relative isolate self-start md:sticky md:top-4">
          <div aria-hidden="true" className="glow-accent animate-breathe absolute -inset-[12%] -z-10 rounded-full opacity-80 blur-2xl" />
          <div className={unavailable ? 'grayscale' : ''}>
            {shared ? (
              <SharedTarget slug={item.slug} kind="media">
                <ItemMedia item={item} variant="detail" sizes="(min-width: 768px) 440px, 92vw" priority />
              </SharedTarget>
            ) : (
              <ItemMedia item={item} variant="detail" sizes="(min-width: 768px) 440px, 92vw" priority />
            )}
          </div>
          <div className="absolute inset-x-3 top-3 flex flex-wrap gap-1.5">
            {unavailable && <UnavailableBadge note={item.unavailableNote} />}
            {!unavailable && item.topRated && <TopRatedBadge />}
            {item.badges.map((b) => (
              <ItemBadge key={b} badge={b} />
            ))}
          </div>
          {item.calories ? (
            <span className="glass-strong absolute -bottom-4 end-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm leading-ui font-semibold text-fg shadow-card">
              <Flame size={16} strokeWidth={2} fill="currentColor" className="text-gold" aria-hidden="true" />
              <span dir="ltr" className="tabular">{formatInt(item.calories)}</span>
              {ar.item.calories}
            </span>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <header className="flex flex-col gap-1">
            {shared ? (
              <SharedTarget slug={item.slug} kind="title" className="w-fit">
                <h2 id={modalTitleId(item.slug)} className="text-[30px] leading-heading font-bold text-fg sm:text-4xl" data-item-name>
                  {item.nameAr}
                </h2>
              </SharedTarget>
            ) : (
              <Title className="text-[30px] leading-heading font-bold text-fg sm:text-4xl" data-item-name>
                {item.nameAr}
              </Title>
            )}
            <En className="font-cairo-light text-sm leading-ui text-muted">{item.nameEn}</En>
            {item.taglineAr && <p className="mt-2 text-base leading-ar text-fg/85">{item.taglineAr}</p>}
            {item.taglineEn && (
              <En as="p" caps={false} className="font-cairo-light text-sm leading-ui text-muted">
                {item.taglineEn}
              </En>
            )}
          </header>

          <PricePills prices={item.prices} />

          {(item.descriptionAr || item.descriptionEn) && (
            <section aria-label={ar.item.description} className="flex flex-col gap-1">
              {item.descriptionAr && <p className="text-[15px] leading-ar text-fg/90">{item.descriptionAr}</p>}
              {item.descriptionEn && (
                <En as="p" caps={false} className="text-sm leading-ar text-muted">
                  {item.descriptionEn}
                </En>
              )}
            </section>
          )}

          {item.ingredients.length > 0 && (
            <section aria-labelledby="ingredients-title" className="flex flex-col gap-2">
              <h3 id="ingredients-title" className="text-sm leading-ui font-semibold text-muted">
                {ar.item.ingredients}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {item.ingredients.map((ing) => (
                  <li key={ing} className="glass rounded-full px-3 py-1.5 text-sm leading-ui text-fg">
                    {ing}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <RateCta itemId={item.id} itemName={item.nameAr} unavailable={unavailable} />

          <RatingSummary itemId={item.id} stats={item.stats} avg={item.avg} />

          <section aria-labelledby="reviews-title" className="flex flex-col gap-3" data-reviews>
            <h3 id="reviews-title" className="text-lg leading-heading font-bold text-fg">
              {ar.item.reviewsTitle}
            </h3>
            <ReviewsList itemId={item.id} initial={comments.comments} initialCursor={comments.nextCursor} />
          </section>
        </div>
      </article>

      <RelatedRow items={ctx.related} />
    </div>
  );
}

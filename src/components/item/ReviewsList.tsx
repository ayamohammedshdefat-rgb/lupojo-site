'use client';

import { LoaderCircle, MessageSquareText } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import { Stars } from '@/components/ui/Stars';
import { ar } from '@/i18n/ar';
import { formatDate, formatRelative } from '@/lib/format';
import type { ApprovedComment } from '@/types/menu';

const noop = () => () => {};

/** Relative time on the client ("قبل 3 أيام"); a stable absolute date on the server. */
function When({ iso }: { iso: string }) {
  const text = useSyncExternalStore(noop, () => formatRelative(iso), () => formatDate(iso));
  return (
    <time dateTime={iso} className="text-xs leading-ui font-cairo-light text-muted">
      {text}
    </time>
  );
}

type ReviewsListProps = {
  itemId: string;
  initial: ApprovedComment[];
  initialCursor: string | null;
};

/** "آراء الزبائن": approved comments only, newest first, 5 per page, rendered as plain text. */
export function ReviewsList({ itemId, initial, initialCursor }: ReviewsListProps) {
  const [comments, setComments] = useState(initial);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const more = async () => {
    if (!cursor) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/items/${encodeURIComponent(itemId)}/reviews?cursor=${encodeURIComponent(cursor)}`);
      if (!res.ok) throw new Error(String(res.status));
      const page = (await res.json()) as { comments: ApprovedComment[]; nextCursor: string | null };
      setComments((c) => [...c, ...page.comments.filter((n) => !c.some((x) => x.id === n.id))]);
      setCursor(page.nextCursor);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (comments.length === 0) {
    return (
      <div className="glass flex items-center gap-3 rounded-[22px] p-4 text-sm leading-ar text-muted">
        <MessageSquareText size={22} strokeWidth={1.75} className="shrink-0 text-accent-hi" aria-hidden="true" />
        {ar.item.noReviews}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3" data-reviews-list>
        {comments.map((c) => (
          <li key={c.id} className="glass flex flex-col gap-2 rounded-[22px] p-4" data-review>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm leading-ui font-semibold text-fg">{c.displayName}</span>
              <When iso={c.createdAt} />
            </div>
            <Stars value={c.rating} size={14} label={`${c.rating} من 5`} />
            <p className="text-[15px] leading-ar whitespace-pre-line text-fg/90" data-customer-comment>
              {c.comment}
            </p>
          </li>
        ))}
      </ul>
      {cursor && (
        <button
          type="button"
          onClick={more}
          disabled={loading}
          className="glass mx-auto flex min-h-11 items-center gap-2 rounded-full px-6 text-sm leading-ui font-semibold text-fg hover:bg-white/10 disabled:opacity-60"
        >
          {loading && <LoaderCircle size={16} strokeWidth={2} className="animate-spin" aria-hidden="true" />}
          {ar.item.showMore}
        </button>
      )}
      {error && (
        <p role="alert" className="text-center text-sm leading-ui text-danger">
          {ar.errors.unexpected}
        </p>
      )}
    </div>
  );
}

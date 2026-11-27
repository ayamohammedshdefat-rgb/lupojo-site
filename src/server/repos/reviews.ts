import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { Timestamp, type DocumentData, type QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { adminDb } from '../firebase-admin';
import { TAGS } from '../tags';
import { toISO } from './mappers';
import type { ApprovedComment } from '@/types/menu';

export const COMMENTS_PAGE = 5;

export type CommentsPage = { comments: ApprovedComment[]; nextCursor: string | null };

/** gRPC FAILED_PRECONDITION: the composite index is missing or still building. */
const FAILED_PRECONDITION = 9;

function toComment(d: QueryDocumentSnapshot<DocumentData>): ApprovedComment {
  const data = d.data();
  return {
    id: d.id,
    displayName: typeof data.displayName === 'string' ? data.displayName : '',
    rating: typeof data.rating === 'number' ? data.rating : 0,
    comment: typeof data.comment === 'string' ? data.comment : '',
    createdAt: toISO(data.createdAt) ?? new Date(0).toISOString(),
  };
}

/**
 * Approved comments for one item, newest first, 5 per page. Only public-safe fields
 * (masked name, stars, text, date); phones live in reviewContacts and never reach this path.
 * `cursor` is the ISO createdAt of the last comment of the previous page.
 */
export async function getApprovedComments(itemId: string, cursor: string | null = null): Promise<CommentsPage> {
  'use cache';
  cacheTag(TAGS.reviews(itemId));
  cacheLife('menu');

  const validCursor = cursor && !Number.isNaN(Date.parse(cursor)) ? cursor : null;
  try {
    let q = adminDb()
      .collection('reviews')
      .where('itemId', '==', itemId)
      .where('commentStatus', '==', 'approved')
      .orderBy('createdAt', 'desc')
      .limit(COMMENTS_PAGE + 1);
    if (validCursor) q = q.startAfter(Timestamp.fromDate(new Date(validCursor)));
    const snap = await q.get();
    const comments = snap.docs.slice(0, COMMENTS_PAGE).map(toComment).filter((c) => c.comment);
    const last = comments.at(-1);
    return { comments, nextCursor: snap.docs.length > COMMENTS_PAGE && last ? last.createdAt : null };
  } catch (err) {
    if ((err as { code?: number }).code !== FAILED_PRECONDITION) throw err;
    // Index not ready (fresh project or still building): single-field query + in-memory filter.
    // Fine at a restaurant's scale; the indexed query takes over once the index exists.
    const snap = await adminDb().collection('reviews').where('itemId', '==', itemId).get();
    const all = snap.docs
      .filter((d) => d.get('commentStatus') === 'approved')
      .map(toComment)
      .filter((c) => c.comment && (!validCursor || c.createdAt < validCursor))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    const comments = all.slice(0, COMMENTS_PAGE);
    const last = comments.at(-1);
    return { comments, nextCursor: all.length > COMMENTS_PAGE && last ? last.createdAt : null };
  }
}

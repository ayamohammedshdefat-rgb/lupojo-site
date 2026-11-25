import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../firebase-admin';
import { TAGS } from '../tags';
import { toISO } from './mappers';
import type { ApprovedComment } from '@/types/menu';

export const COMMENTS_PAGE = 5;

export type CommentsPage = { comments: ApprovedComment[]; nextCursor: string | null };

/**
 * Approved comments for one item, newest first, 5 per page. Only public-safe fields
 * (masked name, stars, text, date); phones live in reviewContacts and never reach this path.
 * `cursor` is the ISO createdAt of the last comment of the previous page.
 */
export async function getApprovedComments(itemId: string, cursor: string | null = null): Promise<CommentsPage> {
  'use cache';
  cacheTag(TAGS.reviews(itemId));
  cacheLife('menu');

  let q = adminDb()
    .collection('reviews')
    .where('itemId', '==', itemId)
    .where('commentStatus', '==', 'approved')
    .orderBy('createdAt', 'desc')
    .limit(COMMENTS_PAGE + 1);
  if (cursor && !Number.isNaN(Date.parse(cursor))) q = q.startAfter(Timestamp.fromDate(new Date(cursor)));

  const snap = await q.get();
  const docs = snap.docs.slice(0, COMMENTS_PAGE);
  const comments: ApprovedComment[] = docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        displayName: typeof data.displayName === 'string' ? data.displayName : '',
        rating: typeof data.rating === 'number' ? data.rating : 0,
        comment: typeof data.comment === 'string' ? data.comment : '',
        createdAt: toISO(data.createdAt) ?? new Date(0).toISOString(),
      };
    })
    .filter((c) => c.comment);
  const last = comments.at(-1);
  return { comments, nextCursor: snap.docs.length > COMMENTS_PAGE && last ? last.createdAt : null };
}

'use server';
import 'server-only';

import { headers } from 'next/headers';
import { updateTag } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';
import { reviewInputSchema, type ReviewInput } from '@/schemas/review';
import { ar } from '@/i18n/ar';
import { maskName } from '@/lib/format';
import { adminDb } from '../firebase-admin';
import { reviewId } from '../hash';
import { clientIp, consumeRateLimit } from '../rate-limit';
import { verifyTurnstile } from '../turnstile';
import { applyRatingChange, approvedDelta, average } from '../stats';
import { mapStats } from '../repos/mappers';
import { TAGS } from '../tags';

type FieldKey = 'rating' | 'name' | 'phone' | 'comment';

export type SubmitReviewResult =
  | {
      ok: true;
      updated: boolean;
      hasComment: boolean;
      commentPending: boolean;
      message: string;
      stats?: { count: number; sum: number; avg: number; dist: Record<'1' | '2' | '3' | '4' | '5', number> };
    }
  | {
      ok: false;
      code: 'validation' | 'not_found' | 'unavailable' | 'rate_limited' | 'captcha' | 'unexpected';
      message: string;
      fieldErrors?: Partial<Record<FieldKey, string>>;
    };

const IP_LIMIT = 60; // per hour (restaurant Wi-Fi is shared)
const PHONE_LIMIT = 30; // per day

/**
 * Customer rating for ONE item (never the restaurant as a whole).
 * zod -> honeypot -> Turnstile -> rate limits -> item checks -> one transaction
 * (review + private contact + item stats) -> cache invalidation.
 * One review per phone per item: resubmitting updates the previous review.
 */
export async function submitReview(raw: ReviewInput): Promise<SubmitReviewResult> {
  const parsed = reviewInputSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<FieldKey, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if ((key === 'rating' || key === 'name' || key === 'phone' || key === 'comment') && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    const first = Object.values(fieldErrors)[0] ?? ar.errors.unexpected;
    return { ok: false, code: 'validation', message: first, fieldErrors };
  }
  const input = parsed.data;

  // Honeypot: bots that fill the hidden field get a silent, write-free "success".
  if (input.website) {
    return { ok: true, updated: false, hasComment: false, commentPending: false, message: ar.rating.successNoComment };
  }

  const h = await headers();
  const ip = clientIp(h);
  if (!(await verifyTurnstile(input.turnstileToken, ip))) {
    return { ok: false, code: 'captcha', message: ar.errors.unexpected };
  }

  try {
    const [ipOk, phoneOk] = await Promise.all([
      consumeRateLimit('review-ip', ip, IP_LIMIT, 3600),
      consumeRateLimit('review-phone', input.phone, PHONE_LIMIT, 86400),
    ]);
    if (!ipOk || !phoneOk) return { ok: false, code: 'rate_limited', message: ar.errors.rateLimited };

    const db = adminDb();
    const itemSnap = await db.doc(`items/${input.itemId}`).get();
    const item = itemSnap.data();
    if (!itemSnap.exists || !item || item.visibility !== 'visible') {
      return { ok: false, code: 'not_found', message: ar.errors.unexpected };
    }
    const sectionSnap = await db.doc(`sections/${String(item.sectionId)}`).get();
    if (!sectionSnap.exists || sectionSnap.get('visibility') !== 'visible') {
      return { ok: false, code: 'not_found', message: ar.errors.unexpected };
    }
    if (item.availability === 'unavailable') {
      return { ok: false, code: 'unavailable', message: ar.errors.unavailable };
    }

    const settings = (await db.doc('settings/site').get()).data();
    const autoApprove = settings?.reviews?.autoApproveComments === true;
    const commentStatus = input.comment ? (autoApprove ? 'approved' : 'pending') : 'none';

    const id = reviewId(input.itemId, input.phone);
    const reviewRef = db.doc(`reviews/${id}`);
    const contactRef = db.doc(`reviewContacts/${id}`);
    const statsRef = db.doc(`itemStats/${input.itemId}`);
    const now = FieldValue.serverTimestamp();

    const result = await db.runTransaction(async (tx) => {
      const snaps = await tx.getAll(reviewRef, statsRef);
      const reviewSnap = snaps[0]!;
      const statsSnap = snaps[1]!;
      const prev = reviewSnap.exists ? reviewSnap.data() : undefined;
      const prevRating = typeof prev?.rating === 'number' ? prev.rating : null;
      const stats = mapStats(statsSnap.data());
      const next = applyRatingChange(stats, prevRating, input.rating);
      const approvedComments = Math.max(
        0,
        stats.approvedComments + approvedDelta(prev?.commentStatus === 'approved', commentStatus === 'approved'),
      );

      tx.set(
        statsRef,
        { count: next.count, sum: next.sum, dist: next.dist, approvedComments, lastReviewAt: now },
        { merge: true },
      );
      tx.set(
        reviewRef,
        {
          itemId: input.itemId,
          rating: input.rating,
          comment: input.comment ?? FieldValue.delete(),
          displayName: maskName(input.name),
          commentStatus,
          createdAt: prev?.createdAt ?? now,
          updatedAt: now,
          moderatedBy: FieldValue.delete(),
          moderatedAt: FieldValue.delete(),
        },
        { merge: true },
      );
      tx.set(
        contactRef,
        { fullName: input.name, phoneE164: input.phone, createdAt: prev ? (prev.createdAt ?? now) : now, updatedAt: now },
        { merge: true },
      );
      return { updated: !!prev, next };
    });

    updateTag(TAGS.menu);
    updateTag(TAGS.reviews(input.itemId));

    const hasComment = !!input.comment;
    const commentPending = commentStatus === 'pending';
    return {
      ok: true,
      updated: result.updated,
      hasComment,
      commentPending,
      message: result.updated ? ar.rating.updated : commentPending ? ar.rating.successWithComment : ar.rating.successNoComment,
      stats: { count: result.next.count, sum: result.next.sum, avg: average(result.next), dist: result.next.dist },
    };
  } catch (err) {
    // Never log personal data (name/phone); the error object carries none.
    console.error('submitReview failed', err instanceof Error ? err.message : 'unknown');
    return { ok: false, code: 'unexpected', message: ar.errors.unexpected };
  }
}

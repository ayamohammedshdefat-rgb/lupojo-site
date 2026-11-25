import 'server-only';
import { createHmac } from 'node:crypto';

function secret(): string {
  const s = process.env.REVIEW_HASH_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true' || process.env.NODE_ENV !== 'production') {
    return 'lupo-dev-only-review-hash-secret';
  }
  throw new Error('REVIEW_HASH_SECRET must be set (>= 16 chars) in production');
}

/** HMAC-SHA256 hex digest with REVIEW_HASH_SECRET. Used for review ids and rate-limit keys. */
export function hmac(value: string): string {
  return createHmac('sha256', secret()).update(value, 'utf8').digest('hex');
}

/** One review per phone per item: id = HMAC(itemId + ":" + phoneE164). */
export function reviewId(itemId: string, phoneE164: string): string {
  return hmac(`${itemId}:${phoneE164}`);
}

import 'server-only';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from './firebase-admin';
import { hmac } from './hash';

/**
 * Fixed-window rate limit backed by Firestore counters (rateLimits/{hash}; server-only collection).
 * Keys are HMAC'd, so raw IPs and phone numbers are never stored. Returns false when over the limit.
 */
export async function consumeRateLimit(scope: string, rawKey: string, limit: number, windowSec: number): Promise<boolean> {
  const ref = adminDb().doc(`rateLimits/${hmac(`${scope}:${rawKey}`)}`);
  const now = Date.now();
  return adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data() as { count?: number; windowStart?: Timestamp } | undefined;
    const start = data?.windowStart?.toMillis() ?? 0;
    if (!snap.exists || now - start >= windowSec * 1000) {
      tx.set(ref, { scope, count: 1, windowStart: Timestamp.fromMillis(now), expireAt: Timestamp.fromMillis(now + windowSec * 1000) });
      return true;
    }
    if ((data?.count ?? 0) >= limit) return false;
    tx.update(ref, { count: FieldValue.increment(1) });
    return true;
  });
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return headers.get('x-real-ip') ?? 'unknown';
}

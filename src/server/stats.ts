import 'server-only';
import type { ItemStats, StarDist, StarKey } from '@/types/menu';

export type StatsCore = Pick<ItemStats, 'count' | 'sum' | 'dist'>;

export const emptyDist = (): StarDist => ({ '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 });

export const emptyStats = (): ItemStats => ({
  count: 0,
  sum: 0,
  dist: emptyDist(),
  approvedComments: 0,
  lastReviewAt: null,
});

const key = (r: number) => String(r) as StarKey;

function assertRating(r: number) {
  if (!Number.isInteger(r) || r < 1 || r > 5) throw new RangeError(`invalid rating ${r}`);
}

/**
 * Applies one review change to the aggregate:
 * add (prev=null), update (prev and next) or delete (next=null). Never goes negative.
 */
export function applyRatingChange<T extends StatsCore>(stats: T, prev: number | null, next: number | null): T {
  const dist = { ...stats.dist };
  let { count, sum } = stats;
  if (prev !== null) {
    assertRating(prev);
    count = Math.max(0, count - 1);
    sum = Math.max(0, sum - prev);
    dist[key(prev)] = Math.max(0, dist[key(prev)] - 1);
  }
  if (next !== null) {
    assertRating(next);
    count += 1;
    sum += next;
    dist[key(next)] += 1;
  }
  return { ...stats, count, sum, dist };
}

/** Adjusts the approved-comment counter when a comment's moderation status changes. */
export function approvedDelta(prevApproved: boolean, nextApproved: boolean): number {
  return (nextApproved ? 1 : 0) - (prevApproved ? 1 : 0);
}

export function average(stats: Pick<StatsCore, 'count' | 'sum'>): number {
  return stats.count === 0 ? 0 : Math.round((stats.sum / stats.count) * 100) / 100;
}

/** Computed badge: average >= 4.5 with at least 10 ratings. */
export function isTopRated(stats: Pick<StatsCore, 'count' | 'sum'>): boolean {
  return stats.count >= 10 && average(stats) >= 4.5;
}

/** Weighted overall average across items (dashboard KPI). */
export function weightedAverage(list: Pick<StatsCore, 'count' | 'sum'>[]): number {
  const count = list.reduce((a, s) => a + s.count, 0);
  const sum = list.reduce((a, s) => a + s.sum, 0);
  return average({ count, sum });
}

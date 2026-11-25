/** Fired by the rating sheet after a successful submit so the open detail can update its numbers at once. */
export const STATS_EVENT = 'lupo:stats';

export type LiveStats = {
  count: number;
  sum: number;
  avg: number;
  dist: Record<'1' | '2' | '3' | '4' | '5', number>;
};

export type StatsEventDetail = { itemId: string; stats: LiveStats };

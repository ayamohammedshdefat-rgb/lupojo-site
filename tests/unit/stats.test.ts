import { describe, expect, it } from 'vitest';
import { applyRatingChange, approvedDelta, average, emptyStats, isTopRated, weightedAverage } from '@/server/stats';

describe('stats math', () => {
  it('adds ratings', () => {
    let s = emptyStats();
    s = applyRatingChange(s, null, 5);
    s = applyRatingChange(s, null, 3);
    expect(s.count).toBe(2);
    expect(s.sum).toBe(8);
    expect(s.dist).toEqual({ '1': 0, '2': 0, '3': 1, '4': 0, '5': 1 });
    expect(average(s)).toBe(4);
  });

  it('updates a rating without changing the count', () => {
    let s = applyRatingChange(emptyStats(), null, 2);
    s = applyRatingChange(s, 2, 5);
    expect(s.count).toBe(1);
    expect(s.sum).toBe(5);
    expect(s.dist['2']).toBe(0);
    expect(s.dist['5']).toBe(1);
  });

  it('deletes a rating and never goes negative', () => {
    let s = applyRatingChange(emptyStats(), null, 4);
    s = applyRatingChange(s, 4, null);
    expect(s).toMatchObject({ count: 0, sum: 0 });
    s = applyRatingChange(s, 4, null);
    expect(s).toMatchObject({ count: 0, sum: 0 });
    expect(s.dist['4']).toBe(0);
    expect(average(s)).toBe(0);
  });

  it('rejects invalid ratings', () => {
    expect(() => applyRatingChange(emptyStats(), null, 6)).toThrow(RangeError);
    expect(() => applyRatingChange(emptyStats(), 0, null)).toThrow(RangeError);
  });

  it('computes the top-rated badge (avg >= 4.5, count >= 10)', () => {
    expect(isTopRated({ count: 10, sum: 45 })).toBe(true);
    expect(isTopRated({ count: 9, sum: 45 })).toBe(false);
    expect(isTopRated({ count: 10, sum: 44 })).toBe(false);
  });

  it('weights the overall average by count', () => {
    expect(weightedAverage([{ count: 1, sum: 5 }, { count: 3, sum: 6 }])).toBe(2.75);
    expect(weightedAverage([])).toBe(0);
  });

  it('tracks approved-comment deltas', () => {
    expect(approvedDelta(false, true)).toBe(1);
    expect(approvedDelta(true, false)).toBe(-1);
    expect(approvedDelta(true, true)).toBe(0);
  });
});

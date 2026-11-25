import { describe, expect, it } from 'vitest';
import {
  formatJD,
  formatPriceList,
  formatRating,
  formatRatingCount,
  formatRelative,
  maskName,
  parseJDToFils,
  toWesternDigits,
} from '@/lib/format';

describe('money', () => {
  it('formats fils as JD with 2–3 decimals', () => {
    expect(formatJD(2750)).toBe('2.75 JD');
    expect(formatJD(600)).toBe('0.60 JD');
    expect(formatJD(1000)).toBe('1.00 JD');
    expect(formatJD(300)).toBe('0.30 JD');
    expect(formatJD(2755)).toBe('2.755 JD');
  });

  it('joins variants', () => {
    expect(formatPriceList([2750, 3500])).toBe('2.75 / 3.50 JD');
    expect(formatPriceList([2500])).toBe('2.50 JD');
    expect(formatPriceList([])).toBe('');
  });

  it('parses owner input into fils', () => {
    expect(parseJDToFils('2.75')).toBe(2750);
    expect(parseJDToFils('٢٫٧٥')).toBe(2750);
    expect(parseJDToFils('0.6 JD')).toBe(600);
    expect(parseJDToFils('3')).toBe(3000);
    expect(parseJDToFils('1.2345')).toBeNull();
    expect(parseJDToFils('abc')).toBeNull();
  });
});

describe('ratings', () => {
  it('formats the average to one decimal with Western digits', () => {
    expect(formatRating(4.56)).toBe('4.6');
    expect(formatRating(5)).toBe('5.0');
  });

  it('uses the Arabic plural categories', () => {
    expect(formatRatingCount(0)).toBe('لا توجد تقييمات');
    expect(formatRatingCount(1)).toBe('تقييم واحد');
    expect(formatRatingCount(2)).toBe('تقييمان');
    expect(formatRatingCount(3)).toBe('3 تقييمات');
    expect(formatRatingCount(10)).toBe('10 تقييمات');
    expect(formatRatingCount(11)).toBe('11 تقييمًا');
    expect(formatRatingCount(99)).toBe('99 تقييمًا');
    expect(formatRatingCount(100)).toBe('100 تقييم');
  });
});

describe('misc', () => {
  it('converts Arabic-Indic and Persian digits', () => {
    expect(toWesternDigits('٠٧٩١٢٣٤٥٦٧')).toBe('0791234567');
    expect(toWesternDigits('۰۷۹')).toBe('079');
  });

  it('masks customer names', () => {
    expect(maskName('أحمد علي')).toBe('أحمد ع.');
    expect(maskName('  سارة   محمد  خالد ')).toBe('سارة خ.');
    expect(maskName('Lina')).toBe('Lina');
  });

  it('formats relative time with Western digits', () => {
    const now = new Date('2026-11-25T12:00:00Z');
    expect(formatRelative('2026-11-22T12:00:00Z', now)).toBe('قبل 3 أيام');
    expect(formatRelative('2026-11-25T11:59:50Z', now)).toBe('الآن');
    expect(formatRelative('2026-11-25T11:55:00Z', now)).toMatch(/5/);
  });
});

import { describe, expect, it } from 'vitest';
import { matchesQuery, normalizeSearch } from '@/lib/arabic';

describe('normalizeSearch', () => {
  it('strips tashkeel and tatweel', () => {
    expect(normalizeSearch('يُحضّر')).toBe('يحضر');
    expect(normalizeSearch('بطـــاطا')).toBe('بطاطا');
  });

  it('folds alef, taa marbuta and alef maqsura', () => {
    expect(normalizeSearch('أإآ')).toBe('ااا');
    expect(normalizeSearch('وجبة')).toBe('وجبه');
    expect(normalizeSearch('على')).toBe('علي');
  });

  it('converts digits and folds Latin', () => {
    expect(normalizeSearch('٢ دبل')).toBe('2 دبل');
    expect(normalizeSearch('Jalapeño')).toBe('jalapeno');
    expect(normalizeSearch('  DOUBLE   Smash ')).toBe('double smash');
  });
});

describe('matchesQuery', () => {
  const hay = 'دبل سماش Double Smash';
  it('matches Arabic and English, any token order', () => {
    expect(matchesQuery(hay, 'سماش')).toBe(true);
    expect(matchesQuery(hay, 'smash double')).toBe(true);
    expect(matchesQuery('بطاطا كبيرة Big Fries', 'بطاطا كبيره')).toBe(true);
    expect(matchesQuery('هالبينو Jalapeño', 'jalapeno')).toBe(true);
  });
  it('rejects non-matches and accepts empty queries', () => {
    expect(matchesQuery(hay, 'تشكن')).toBe(false);
    expect(matchesQuery(hay, '   ')).toBe(true);
  });
});

import { toWesternDigits } from './format';

/** Tashkeel, Quranic marks and tatweel. */
const ARABIC_MARKS = /[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۨ-ۭـ]/g;

/**
 * Normalizes Arabic/English text for search:
 * strips tashkeel and tatweel, folds أ/إ/آ/ٱ -> ا, ة -> ه, ى -> ي,
 * converts Arabic-Indic digits, lowercases Latin and strips Latin accents (Jalapeño -> jalapeno).
 */
export function normalizeSearch(input: string): string {
  return toWesternDigits(input)
    .normalize('NFKC')
    .replace(ARABIC_MARKS, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** True when every token of the query appears somewhere in the haystack (both normalized). */
export function matchesQuery(haystack: string, query: string): boolean {
  const q = normalizeSearch(query);
  if (!q) return true;
  const h = normalizeSearch(haystack);
  return q.split(' ').every((token) => h.includes(token));
}

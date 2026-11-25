/** Formatting helpers. Western digits everywhere via the `ar-u-nu-latn` locale. */

export const LOCALE = 'ar-u-nu-latn';
export const DATE_LOCALE = 'ar-JO-u-nu-latn';
export const TIME_ZONE = 'Asia/Amman';

const priceFormat = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
  useGrouping: false,
});

/** 2750 fils -> "2.75" (2–3 decimals as needed). */
export function formatAmount(fils: number): string {
  return priceFormat.format(fils / 1000);
}

/** 2750 fils -> "2.75 JD". Render inside `dir="ltr"`. */
export function formatJD(fils: number): string {
  return `${formatAmount(fils)} JD`;
}

/** [2750, 3500] -> "2.75 / 3.50 JD". */
export function formatPriceList(amounts: readonly number[]): string {
  if (amounts.length === 0) return '';
  return `${amounts.map(formatAmount).join(' / ')} JD`;
}

/** Parses a JD amount typed by the owner ("2.75", "2,750", "٢٫٧٥") into integer fils. */
export function parseJDToFils(input: string): number | null {
  const s = toWesternDigits(input).replace(/[٫,]/g, '.').replace(/\s|JD/gi, '');
  if (!/^\d{1,4}(\.\d{1,3})?$/.test(s)) return null;
  const [whole = '0', frac = ''] = s.split('.');
  return Number(whole) * 1000 + Number(frac.padEnd(3, '0'));
}

const ratingFormat = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** 4.56 -> "4.6". */
export function formatRating(avg: number): string {
  return ratingFormat.format(avg);
}

const intFormat = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
export function formatInt(n: number): string {
  return intFormat.format(n);
}

const plural = new Intl.PluralRules('ar');

/**
 * Arabic count of ratings with the correct plural form:
 * 0 "لا توجد تقييمات" · 1 "تقييم واحد" · 2 "تقييمان" · few "n تقييمات" · many "n تقييمًا" · other "n تقييم".
 */
export function formatRatingCount(n: number): string {
  switch (plural.select(n)) {
    case 'zero':
      return 'لا توجد تقييمات';
    case 'one':
      return 'تقييم واحد';
    case 'two':
      return 'تقييمان';
    case 'few':
      return `${formatInt(n)} تقييمات`;
    case 'many':
      return `${formatInt(n)} تقييمًا`;
    default:
      return `${formatInt(n)} تقييم`;
  }
}

/** Same plural rules for "reviews linked to this item" in the delete dialog. */
export function formatLinkedReviews(n: number): string {
  return n === 0 ? 'لا توجد تقييمات مرتبطة' : `${formatRatingCount(n)} ${n <= 2 ? 'مرتبط' : 'مرتبطة'}`;
}

const relative = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

/** "قبل 3 أيام", "أمس", "الآن". */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const diff = (new Date(iso).getTime() - now.getTime()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 45) return 'الآن';
  for (const [unit, secs] of UNITS) {
    if (abs >= secs || unit === 'minute') return relative.format(Math.round(diff / secs), unit);
  }
  return 'الآن';
}

const dateTime = new Intl.DateTimeFormat(DATE_LOCALE, {
  timeZone: TIME_ZONE,
  dateStyle: 'medium',
  timeStyle: 'short',
});
const dateOnly = new Intl.DateTimeFormat(DATE_LOCALE, { timeZone: TIME_ZONE, dateStyle: 'medium' });

export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}
export function formatDate(iso: string): string {
  return dateOnly.format(new Date(iso));
}

/** Converts Arabic-Indic (٠-٩) and Persian (۰-۹) digits to Western digits. */
export function toWesternDigits(s: string): string {
  return s
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/** "أحمد علي" -> "أحمد ع." ; single names stay as they are. */
export function maskName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0]!;
  if (parts.length === 1) return first;
  const last = parts[parts.length - 1]!;
  const initial = Array.from(last)[0] ?? '';
  return `${first} ${initial}.`;
}

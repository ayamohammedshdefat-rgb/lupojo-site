import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import { toWesternDigits } from './format';

/**
 * Normalizes a phone typed by a customer (Arabic-Indic/Persian digits, spaces, dashes, 00 prefix)
 * and validates it with libphonenumber-js (max metadata, default region JO).
 * Returns E.164 (e.g. "+962791234567") or null when invalid.
 */
export function toE164(input: string): string | null {
  const cleaned = toWesternDigits(input)
    .replace(/[\s ‎‏\-().]/g, '')
    .replace(/^00/, '+');
  if (!/^\+?\d{6,15}$/.test(cleaned)) return null;
  const parsed = parsePhoneNumberFromString(cleaned, 'JO');
  if (!parsed || !parsed.isValid()) return null;
  return parsed.number;
}

/** "+962791234567" -> "+962 79 *** 4567" for owner views that don't need the full number. */
export function maskPhone(e164: string): string {
  if (e164.length < 8) return e164;
  return `${e164.slice(0, -7)}***${e164.slice(-4)}`;
}

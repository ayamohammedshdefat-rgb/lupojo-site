import { describe, expect, it } from 'vitest';
import { reviewInputSchema } from '@/schemas/review';
import { itemInputSchema, sectionInputSchema } from '@/schemas/menu';
import { toE164 } from '@/lib/phone';
import { ar } from '@/i18n/ar';

const base = { itemId: 'abc', rating: 4, name: 'أحمد علي', phone: '0791234567' };

const firstError = (r: { success: boolean; error?: { issues: { message: string }[] } }) => r.error?.issues[0]?.message;

describe('phone normalization', () => {
  it.each(['0791234567', '+962 79 123 4567', '٠٧٩١٢٣٤٥٦٧', '00962791234567', '079-123-4567', '۰۷۹۱۲۳۴۵۶۷'])(
    '%s -> +962791234567',
    (input) => {
      expect(toE164(input)).toBe('+962791234567');
    },
  );
  it('accepts international numbers', () => {
    expect(toE164('+44 7911 123456')).toBe('+447911123456');
  });
  it.each(['12345', '', 'abc', '0791', '+962 12'])('rejects %s', (input) => {
    expect(toE164(input)).toBeNull();
  });
});

describe('reviewInputSchema', () => {
  it('accepts a valid review and stores E.164', () => {
    const r = reviewInputSchema.parse({ ...base, phone: '٠٧٩١٢٣٤٥٦٧', comment: '  رائع جدًا  ' });
    expect(r.phone).toBe('+962791234567');
    expect(r.comment).toBe('رائع جدًا');
  });

  it('treats an empty comment as none', () => {
    expect(reviewInputSchema.parse({ ...base, comment: '   ' }).comment).toBeUndefined();
  });

  it('requires 1–5 integer stars', () => {
    for (const rating of [0, 6, 3.5]) {
      expect(firstError(reviewInputSchema.safeParse({ ...base, rating }))).toBe(ar.errors.stars);
    }
  });

  it('validates names', () => {
    for (const name of ['أ', 'x', '123', 'Ahmad<script>', 'a'.repeat(41)]) {
      expect(firstError(reviewInputSchema.safeParse({ ...base, name }))).toBe(ar.errors.name);
    }
    expect(reviewInputSchema.parse({ ...base, name: "O'Neil-Smith Jr." }).name).toBe("O'Neil-Smith Jr.");
  });

  it('validates phones', () => {
    expect(firstError(reviewInputSchema.safeParse({ ...base, phone: '12345' }))).toBe(ar.errors.phone);
  });

  it('limits comments and blocks links', () => {
    expect(firstError(reviewInputSchema.safeParse({ ...base, comment: 'ا'.repeat(501) }))).toBe(ar.errors.commentLong);
    for (const comment of ['زوروا https://x.co', 'www.spam.net', 'اطلبوا من lupo-deals.com']) {
      expect(firstError(reviewInputSchema.safeParse({ ...base, comment }))).toBe(ar.errors.commentLinks);
    }
  });
});

describe('owner schemas', () => {
  const item = {
    sectionId: 's1',
    nameAr: 'دبل سماش',
    nameEn: 'Double Smash',
    slug: 'double-smash',
    prices: [{ amountFils: 3250 }],
    icon: 'hamburger',
    visibility: 'visible',
    availability: 'available',
  };

  it('accepts a minimal item', () => {
    expect(itemInputSchema.safeParse(item).success).toBe(true);
  });

  it('rejects emoji in names and descriptions', () => {
    const smile = String.fromCodePoint(0x1f354);
    expect(firstError(itemInputSchema.safeParse({ ...item, nameAr: `برجر ${smile}` }))).toBe(ar.errors.noEmoji);
    expect(firstError(itemInputSchema.safeParse({ ...item, descriptionAr: `لذيذ ${smile}` }))).toBe(ar.errors.noEmoji);
    expect(firstError(sectionInputSchema.safeParse({ nameAr: smile, nameEn: 'X', slug: 'x1', icon: 'flame', visibility: 'visible' }))).toBe(
      ar.errors.noEmoji,
    );
  });

  it('requires at least one price and a known icon', () => {
    expect(itemInputSchema.safeParse({ ...item, prices: [] }).success).toBe(false);
    expect(itemInputSchema.safeParse({ ...item, icon: 'burger-emoji' }).success).toBe(false);
  });

  it('validates slugs', () => {
    expect(itemInputSchema.safeParse({ ...item, slug: 'Double Smash' }).success).toBe(false);
    expect(itemInputSchema.parse({ ...item, slug: 'Double-Smash' }).slug).toBe('double-smash');
  });
});

import { z } from 'zod';
import { ICON_KEYS } from '@/components/icons/keys';
import { BADGES } from '@/types/menu';
import { ar } from '@/i18n/ar';

/** Emoji, flags and keycaps. Owner-managed content must use registry icons instead. */
export const EMOJI_RE = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}⃣️]/u;

export const hasEmoji = (s: string) => EMOJI_RE.test(s);

/** Trimmed text with no emoji (owner content). */
export const plainText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((s) => !hasEmoji(s), { error: ar.errors.noEmoji });

export const requiredText = (max: number) => plainText(max).pipe(z.string().min(1, { error: 'هذا الحقل مطلوب' }));

export const optionalText = (max: number) =>
  plainText(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const iconKeySchema = z.enum(ICON_KEYS);
export const badgeSchema = z.enum(BADGES);
export const visibilitySchema = z.enum(['visible', 'hidden']);
export const availabilitySchema = z.enum(['available', 'unavailable']);

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { error: 'استخدم أحرفًا إنجليزية صغيرة وأرقامًا وشرطات فقط' });

export const imageRefSchema = z.object({
  url: z.url(),
  path: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  blurDataURL: z.string(),
  alt: z.string(),
});

export const priceVariantSchema = z.object({
  labelAr: optionalText(30),
  labelEn: optionalText(30),
  amountFils: z.number().int().min(0).max(1_000_000),
});

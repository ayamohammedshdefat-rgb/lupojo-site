import { z } from 'zod';
import { ar } from '@/i18n/ar';
import { toE164 } from '@/lib/phone';

export const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} '.\-]*$/u;
export const LINK_RE =
  /(?:https?:\/\/|www\.|\b[\w-]+\.(?:com|net|org|io|jo|me|co|app|dev|ly|gl|link|xyz|info|biz|shop|store|site|online|ai)\b|t\.me\/|wa\.me\/)/i;

export const COMMENT_MAX = 500;

/** Customer rating input, shared by the rating sheet (client) and `submitReview` (server). */
export const reviewInputSchema = z.object({
  itemId: z.string().min(1).max(64),
  rating: z
    .number({ error: ar.errors.stars })
    .int({ error: ar.errors.stars })
    .min(1, { error: ar.errors.stars })
    .max(5, { error: ar.errors.stars }),
  name: z
    .string({ error: ar.errors.name })
    .trim()
    .transform((s) => s.replace(/\s+/g, ' '))
    .pipe(
      z
        .string()
        .min(2, { error: ar.errors.name })
        .max(40, { error: ar.errors.name })
        .regex(NAME_RE, { error: ar.errors.name })
        .refine((s) => (s.match(/\p{L}/gu) ?? []).length >= 2, { error: ar.errors.name }),
    ),
  phone: z
    .string({ error: ar.errors.phone })
    .max(32, { error: ar.errors.phone })
    .transform((s, ctx) => {
      const e164 = toE164(s);
      if (!e164) {
        ctx.addIssue({ code: 'custom', message: ar.errors.phone });
        return z.NEVER;
      }
      return e164;
    }),
  comment: z
    .string()
    .trim()
    .max(COMMENT_MAX, { error: ar.errors.commentLong })
    .refine((s) => !LINK_RE.test(s), { error: ar.errors.commentLinks })
    .optional()
    .transform((s) => (s ? s : undefined)),
  /** Honeypot: checked separately by the server (bots that fill it get a silent no-op). */
  website: z.string().max(200).optional(),
  turnstileToken: z.string().max(4096).optional(),
});

export type ReviewInput = z.input<typeof reviewInputSchema>;
export type ReviewParsed = z.output<typeof reviewInputSchema>;

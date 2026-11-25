import { z } from 'zod';
import {
  availabilitySchema,
  badgeSchema,
  iconKeySchema,
  imageRefSchema,
  optionalText,
  priceVariantSchema,
  requiredText,
  slugSchema,
  visibilitySchema,
  plainText,
} from './common';

/** Owner input for a section (shared by the admin form and the server action). */
export const sectionInputSchema = z.object({
  nameAr: requiredText(60),
  nameEn: requiredText(60),
  slug: slugSchema,
  icon: iconKeySchema,
  visibility: visibilitySchema,
});
export type SectionInput = z.infer<typeof sectionInputSchema>;

/** Owner input for an item. */
export const itemInputSchema = z.object({
  sectionId: z.string().min(1, { error: 'اختر القسم' }),
  nameAr: requiredText(80),
  nameEn: requiredText(80),
  slug: slugSchema,
  taglineAr: optionalText(120),
  taglineEn: optionalText(120),
  descriptionAr: optionalText(1000),
  descriptionEn: optionalText(1000),
  ingredients: z.array(requiredText(40)).max(30).default([]),
  prices: z.array(priceVariantSchema).min(1, { error: 'أضف سعرًا واحدًا على الأقل' }).max(6),
  calories: z.number().int().min(0).max(5000).optional(),
  badges: z.array(badgeSchema).max(3).default([]),
  icon: iconKeySchema,
  image: imageRefSchema.optional(),
  cutout: imageRefSchema.optional(),
  featured: z.boolean().default(false),
  visibility: visibilitySchema,
  availability: availabilitySchema,
  unavailableNote: optionalText(80),
});
export type ItemInput = z.infer<typeof itemInputSchema>;

const bilingual = z.object({
  titleAr: plainText(120),
  titleEn: plainText(120),
  bodyAr: plainText(400),
  bodyEn: plainText(400),
});

/** Owner input for settings/site. */
export const settingsInputSchema = z.object({
  brandName: requiredText(40),
  metaTitle: requiredText(70),
  metaDescription: requiredText(200),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  taglineEn: plainText(120),
  subtaglineAr: plainText(160),
  subtaglineEn: plainText(160),
  mission: bilingual,
  thanks: bilingual,
  logo: imageRefSchema.nullable().optional(),
  contact: z
    .object({
      phone: optionalText(30),
      whatsapp: optionalText(30),
      instagram: optionalText(60),
      address: optionalText(160),
      hours: optionalText(120),
    })
    .prefault({}),
  introEnabled: z.boolean(),
  reviews: z.object({ autoApproveComments: z.boolean() }),
});
export type SettingsInput = z.infer<typeof settingsInputSchema>;

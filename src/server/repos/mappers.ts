import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { resolveIconKey } from '@/components/icons/keys';
import {
  BADGES,
  type Badge,
  type BilingualBlock,
  type ImageRef,
  type Item,
  type ItemStats,
  type PriceVariant,
  type Section,
  type SiteSettings,
  type StarDist,
} from '@/types/menu';

type Data = Record<string, unknown>;

const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const optStr = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v : undefined);
const num = (v: unknown, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const bool = (v: unknown, fallback = false): boolean => (typeof v === 'boolean' ? v : fallback);
const obj = (v: unknown): Data => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Data) : {});

/** Firestore Timestamp | Date | ISO string -> ISO string (the repo boundary never leaks Timestamps). */
export function toISO(v: unknown): string | null {
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'string' && !Number.isNaN(Date.parse(v))) return new Date(v).toISOString();
  return null;
}

export function mapImage(v: unknown): ImageRef | undefined {
  const d = obj(v);
  const url = optStr(d.url);
  if (!url) return undefined;
  return {
    url,
    path: str(d.path),
    width: num(d.width, 1200),
    height: num(d.height, 960),
    blurDataURL: str(d.blurDataURL),
    alt: str(d.alt),
  };
}

export function mapSection(id: string, d: Data): Section {
  return {
    id,
    slug: str(d.slug, id),
    nameAr: str(d.nameAr),
    nameEn: str(d.nameEn),
    icon: resolveIconKey(d.icon),
    order: num(d.order),
    visibility: d.visibility === 'hidden' ? 'hidden' : 'visible',
  };
}

function mapPrices(v: unknown): PriceVariant[] {
  if (!Array.isArray(v)) return [];
  return v
    .map(obj)
    .filter((p) => typeof p.amountFils === 'number')
    .map((p) => ({ labelAr: optStr(p.labelAr), labelEn: optStr(p.labelEn), amountFils: num(p.amountFils) }));
}

export function mapItem(id: string, d: Data): Item {
  const badges = Array.isArray(d.badges)
    ? d.badges.filter((b): b is Badge => (BADGES as readonly unknown[]).includes(b))
    : [];
  return {
    id,
    slug: str(d.slug, id),
    sectionId: str(d.sectionId),
    nameAr: str(d.nameAr),
    nameEn: str(d.nameEn),
    taglineAr: optStr(d.taglineAr),
    taglineEn: optStr(d.taglineEn),
    descriptionAr: optStr(d.descriptionAr),
    descriptionEn: optStr(d.descriptionEn),
    ingredients: Array.isArray(d.ingredients) ? d.ingredients.filter((x): x is string => typeof x === 'string' && !!x) : [],
    prices: mapPrices(d.prices),
    calories: typeof d.calories === 'number' && d.calories > 0 ? d.calories : undefined,
    badges,
    icon: resolveIconKey(d.icon),
    image: mapImage(d.image),
    cutout: mapImage(d.cutout),
    featured: bool(d.featured),
    visibility: d.visibility === 'hidden' ? 'hidden' : 'visible',
    availability: d.availability === 'unavailable' ? 'unavailable' : 'available',
    unavailableNote: optStr(d.unavailableNote),
    order: num(d.order),
    updatedAt: toISO(d.updatedAt),
  };
}

export function mapStats(d: Data | undefined): ItemStats {
  const s = obj(d);
  const dist = obj(s.dist);
  const fullDist: StarDist = {
    '1': num(dist['1']),
    '2': num(dist['2']),
    '3': num(dist['3']),
    '4': num(dist['4']),
    '5': num(dist['5']),
  };
  return {
    count: num(s.count),
    sum: num(s.sum),
    dist: fullDist,
    approvedComments: num(s.approvedComments),
    lastReviewAt: toISO(s.lastReviewAt),
  };
}

function mapBlock(v: unknown): BilingualBlock {
  const d = obj(v);
  return { titleAr: str(d.titleAr), titleEn: str(d.titleEn), bodyAr: str(d.bodyAr), bodyEn: str(d.bodyEn) };
}

export function mapSettings(d: Data | undefined): SiteSettings {
  const s = obj(d);
  const contact = obj(s.contact);
  return {
    brandName: str(s.brandName, 'LUPO'),
    logo: mapImage(s.logo) ?? null,
    metaTitle: str(s.metaTitle, 'LUPO'),
    metaDescription: str(s.metaDescription),
    themeColor: str(s.themeColor, '#0b0b0b'),
    taglineEn: str(s.taglineEn),
    subtaglineAr: str(s.subtaglineAr),
    subtaglineEn: str(s.subtaglineEn),
    mission: mapBlock(s.mission),
    thanks: mapBlock(s.thanks),
    contact: {
      phone: optStr(contact.phone),
      whatsapp: optStr(contact.whatsapp),
      instagram: optStr(contact.instagram),
      address: optStr(contact.address),
      hours: optStr(contact.hours),
    },
    introEnabled: bool(s.introEnabled, true),
    reviews: { autoApproveComments: bool(obj(s.reviews).autoApproveComments) },
  };
}

import type { IconKey } from '@/components/icons/keys';

/** Client-safe DTOs. Firestore Timestamps are ISO strings at this boundary. */

export type ImageRef = {
  url: string;
  path: string;
  width: number;
  height: number;
  blurDataURL: string;
  alt: string;
};

export type PriceVariant = {
  labelAr?: string;
  labelEn?: string;
  amountFils: number;
};

export const BADGES = ['new', 'bestseller', 'spicy'] as const;
export type Badge = (typeof BADGES)[number];

export type Visibility = 'visible' | 'hidden';
export type Availability = 'available' | 'unavailable';

export type StarKey = '1' | '2' | '3' | '4' | '5';
export type StarDist = Record<StarKey, number>;

export type ItemStats = {
  count: number;
  sum: number;
  dist: StarDist;
  approvedComments: number;
  lastReviewAt: string | null;
};

export type Section = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  icon: IconKey;
  order: number;
  visibility: Visibility;
};

export type Item = {
  id: string;
  slug: string;
  sectionId: string;
  nameAr: string;
  nameEn: string;
  taglineAr?: string;
  taglineEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  ingredients: string[];
  prices: PriceVariant[];
  calories?: number;
  badges: Badge[];
  icon: IconKey;
  image?: ImageRef;
  cutout?: ImageRef;
  featured: boolean;
  visibility: Visibility;
  availability: Availability;
  unavailableNote?: string;
  order: number;
  updatedAt: string | null;
};

export type BilingualBlock = { titleAr: string; titleEn: string; bodyAr: string; bodyEn: string };

export type SiteSettings = {
  brandName: string;
  logo: ImageRef | null;
  metaTitle: string;
  metaDescription: string;
  themeColor: string;
  taglineEn: string;
  subtaglineAr: string;
  subtaglineEn: string;
  mission: BilingualBlock;
  thanks: BilingualBlock;
  contact: {
    phone?: string;
    whatsapp?: string;
    instagram?: string;
    address?: string;
    hours?: string;
  };
  introEnabled: boolean;
  reviews: { autoApproveComments: boolean };
};

/** An item as rendered publicly: always visible, in a visible section, with its stats. */
export type MenuItem = Item & { stats: ItemStats; avg: number; topRated: boolean };
export type MenuSection = Section & { items: MenuItem[] };

export type PublicMenu = {
  settings: SiteSettings;
  sections: MenuSection[];
};

export type ApprovedComment = {
  id: string;
  displayName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

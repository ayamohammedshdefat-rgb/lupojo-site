import {
  Beef,
  CanSoda,
  ChefHat,
  Coffee,
  Cookie,
  CupSoda,
  Drumstick,
  Flame,
  GlassWater,
  Hamburger,
  IceCreamCone,
  Pizza,
  Popcorn,
  Salad,
  Sandwich,
  Soup,
  Utensils,
  type IconNode,
  type LucideIcon,
} from 'lucide-react';
import { pepperChilli } from '@lucide/lab';
import { fries, sauceBottle } from './custom-icons';

/** Every icon an owner can pick. Firestore stores only these keys, never emoji or SVG. */
export const ICON_KEYS = [
  'hamburger',
  'drumstick',
  'beef',
  'sandwich',
  'fries',
  'cup-soda',
  'can-soda',
  'glass-water',
  'coffee',
  'sauce-bottle',
  'pepper-chilli',
  'salad',
  'soup',
  'pizza',
  'popcorn',
  'ice-cream-cone',
  'cookie',
  'chef-hat',
  'flame',
  'utensils',
] as const;

export type IconKey = (typeof ICON_KEYS)[number];

export const FALLBACK_ICON: IconKey = 'utensils';

export type IconEntry =
  | { kind: 'lucide'; Icon: LucideIcon; labelAr: string }
  | { kind: 'node'; node: IconNode; labelAr: string };

export const ICON_REGISTRY: Readonly<Record<IconKey, IconEntry>> = {
  hamburger: { kind: 'lucide', Icon: Hamburger, labelAr: 'برجر' },
  drumstick: { kind: 'lucide', Icon: Drumstick, labelAr: 'دجاج' },
  beef: { kind: 'lucide', Icon: Beef, labelAr: 'لحم' },
  sandwich: { kind: 'lucide', Icon: Sandwich, labelAr: 'ساندويش' },
  fries: { kind: 'node', node: fries, labelAr: 'بطاطا' },
  'cup-soda': { kind: 'lucide', Icon: CupSoda, labelAr: 'مشروب' },
  'can-soda': { kind: 'lucide', Icon: CanSoda, labelAr: 'مشروب غازي' },
  'glass-water': { kind: 'lucide', Icon: GlassWater, labelAr: 'ماء' },
  coffee: { kind: 'lucide', Icon: Coffee, labelAr: 'قهوة' },
  'sauce-bottle': { kind: 'node', node: sauceBottle, labelAr: 'صوص' },
  'pepper-chilli': { kind: 'node', node: pepperChilli, labelAr: 'حار' },
  salad: { kind: 'lucide', Icon: Salad, labelAr: 'سلطة' },
  soup: { kind: 'lucide', Icon: Soup, labelAr: 'شوربة' },
  pizza: { kind: 'lucide', Icon: Pizza, labelAr: 'بيتزا' },
  popcorn: { kind: 'lucide', Icon: Popcorn, labelAr: 'تسالي' },
  'ice-cream-cone': { kind: 'lucide', Icon: IceCreamCone, labelAr: 'آيس كريم' },
  cookie: { kind: 'lucide', Icon: Cookie, labelAr: 'حلويات' },
  'chef-hat': { kind: 'lucide', Icon: ChefHat, labelAr: 'طبق الشيف' },
  flame: { kind: 'lucide', Icon: Flame, labelAr: 'مميز' },
  utensils: { kind: 'lucide', Icon: Utensils, labelAr: 'عام' },
};

export function isIconKey(value: unknown): value is IconKey {
  return typeof value === 'string' && (ICON_KEYS as readonly string[]).includes(value);
}

/** Resolves any stored value to a registry key; unknown keys fall back to `utensils`. */
export function resolveIconKey(value: unknown): IconKey {
  return isIconKey(value) ? value : FALLBACK_ICON;
}

/** Lucide stroke rule: 1.75 everywhere, 2 at 16px and below. */
export function strokeFor(size: number): number {
  return size <= 16 ? 2 : 1.75;
}

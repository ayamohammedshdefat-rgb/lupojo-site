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
import type { IconKey } from './keys';

export { ICON_KEYS, FALLBACK_ICON, isIconKey, resolveIconKey, type IconKey } from './keys';

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

/** Lucide stroke rule: 1.75 everywhere, 2 at 16px and below. */
export function strokeFor(size: number): number {
  return size <= 16 ? 2 : 1.75;
}

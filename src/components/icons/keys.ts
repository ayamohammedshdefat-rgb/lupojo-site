/** Icon keys stored in Firestore (no React imports, so schemas, repos and scripts can use them). */
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

export function isIconKey(value: unknown): value is IconKey {
  return typeof value === 'string' && (ICON_KEYS as readonly string[]).includes(value);
}

/** Resolves any stored value to a registry key; unknown keys fall back to `utensils`. */
export function resolveIconKey(value: unknown): IconKey {
  return isIconKey(value) ? value : FALLBACK_ICON;
}

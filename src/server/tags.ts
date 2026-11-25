import 'server-only';

/** Cache tags for `'use cache'` reads; mutations invalidate with updateTag / revalidateTag. */
export const TAGS = {
  menu: 'menu',
  settings: 'settings',
  item: (id: string) => `item:${id}`,
  reviews: (itemId: string) => `reviews:${itemId}`,
} as const;

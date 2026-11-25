import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { adminDb } from '../firebase-admin';
import { TAGS } from '../tags';
import { average, emptyStats, isTopRated } from '../stats';
import { mapItem, mapSection, mapSettings, mapStats } from './mappers';
import type { ItemContext, MenuItem, MenuSection, PublicMenu, SiteSettings } from '@/types/menu';

export type { ItemContext };

/**
 * The public menu: visible sections with their visible items (ordered) and rating stats.
 * Hidden sections/items never leave this function, so they can't leak into UI, search,
 * sitemap, JSON-LD or the related carousel.
 */
export async function getPublicMenu(): Promise<PublicMenu> {
  'use cache';
  cacheTag(TAGS.menu, TAGS.settings);
  cacheLife('menu');

  const db = adminDb();
  const [settingsSnap, sectionsSnap, itemsSnap, statsSnap] = await Promise.all([
    db.doc('settings/site').get(),
    db.collection('sections').orderBy('order').get(),
    db.collection('items').orderBy('order').get(),
    db.collection('itemStats').get(),
  ]);

  const stats = new Map(statsSnap.docs.map((d) => [d.id, mapStats(d.data())]));
  const visibleSections = sectionsSnap.docs.map((d) => mapSection(d.id, d.data())).filter((s) => s.visibility === 'visible');

  const itemsBySection = new Map<string, MenuItem[]>();
  for (const doc of itemsSnap.docs) {
    const item = mapItem(doc.id, doc.data());
    if (item.visibility !== 'visible' || item.prices.length === 0) continue;
    const s = stats.get(item.id) ?? emptyStats();
    const list = itemsBySection.get(item.sectionId) ?? [];
    list.push({ ...item, stats: s, avg: average(s), topRated: isTopRated(s) });
    itemsBySection.set(item.sectionId, list);
  }

  const sections: MenuSection[] = visibleSections
    .map((s) => ({ ...s, items: itemsBySection.get(s.id) ?? [] }))
    .filter((s) => s.items.length > 0);

  return { settings: mapSettings(settingsSnap.data()), sections };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return (await getPublicMenu()).settings;
}

/** A visible item by slug with its section neighbours and related items; null when hidden/missing. */
export async function getPublicItem(slug: string): Promise<ItemContext | null> {
  const menu = await getPublicMenu();
  for (const section of menu.sections) {
    const idx = section.items.findIndex((i) => i.slug === slug);
    if (idx === -1) continue;
    const item = section.items[idx]!;
    const all = menu.sections.flatMap((s) => s.items).filter((i) => i.id !== item.id);
    const sameSection = all.filter((i) => i.sectionId === item.sectionId);
    const others = all.filter((i) => i.sectionId !== item.sectionId);
    return {
      item,
      section,
      prev: section.items[idx - 1] ?? null,
      next: section.items[idx + 1] ?? null,
      related: [...sameSection, ...others].slice(0, 8),
    };
  }
  return null;
}

export async function getPublicItemSlugs(): Promise<string[]> {
  const menu = await getPublicMenu();
  return menu.sections.flatMap((s) => s.items.map((i) => i.slug));
}

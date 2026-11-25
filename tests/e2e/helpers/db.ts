/**
 * E2E fixtures: read/write the Firebase emulators directly with the Admin SDK.
 * Never points at production (project demo-lupo + emulator hosts are forced here).
 */
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import type { APIRequestContext } from '@playwright/test';

process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099';
process.env.METADATA_SERVER_DETECTION ||= 'none';

let db: Firestore | null = null;
export function testDb(): Firestore {
  if (!db) {
    const app = getApps().find((a) => a.name === 'e2e') ?? initializeApp({ projectId: 'demo-lupo' }, 'e2e');
    db = getFirestore(app);
  }
  return db;
}

export type DbItem = {
  id: string;
  slug: string;
  sectionId: string;
  nameAr: string;
  nameEn: string;
  prices: { labelAr?: string; amountFils: number }[];
  visibility: string;
  availability: string;
};
export type DbSection = { id: string; slug: string; nameAr: string; visibility: string };

export async function visibleItems(): Promise<DbItem[]> {
  const [sections, items] = await Promise.all([
    testDb().collection('sections').get(),
    testDb().collection('items').orderBy('order').get(),
  ]);
  const visibleSections = new Set(sections.docs.filter((d) => d.get('visibility') === 'visible').map((d) => d.id));
  return items.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<DbItem, 'id'>) }))
    .filter((i) => i.visibility === 'visible' && visibleSections.has(i.sectionId));
}

export async function itemBySlug(slug: string): Promise<DbItem> {
  const snap = await testDb().collection('items').where('slug', '==', slug).limit(1).get();
  const doc = snap.docs[0];
  if (!doc) throw new Error(`no item ${slug}`);
  return { id: doc.id, ...(doc.data() as Omit<DbItem, 'id'>) };
}

export async function sectionBySlug(slug: string): Promise<DbSection> {
  const snap = await testDb().collection('sections').where('slug', '==', slug).limit(1).get();
  const doc = snap.docs[0];
  if (!doc) throw new Error(`no section ${slug}`);
  return { id: doc.id, ...(doc.data() as Omit<DbSection, 'id'>) };
}

export async function updateItem(slug: string, data: Record<string, unknown>) {
  const item = await itemBySlug(slug);
  await testDb().doc(`items/${item.id}`).update(data);
}

export async function updateSection(slug: string, data: Record<string, unknown>) {
  const section = await sectionBySlug(slug);
  await testDb().doc(`sections/${section.id}`).update(data);
}

/** Expires the app's cached menu so the next request reads the fixture. */
export async function revalidate(request: APIRequestContext, tags: string[] = ['menu']) {
  const res = await request.post('/api/test/revalidate', { data: { tags } });
  if (!res.ok()) throw new Error(`revalidate failed: ${res.status()}`);
}

/** Puts every item and section back to visible + available. */
export async function restoreMenu(request: APIRequestContext) {
  const [sections, items] = await Promise.all([testDb().collection('sections').get(), testDb().collection('items').get()]);
  const batch = testDb().batch();
  sections.docs.forEach((d) => batch.update(d.ref, { visibility: 'visible' }));
  items.docs.forEach((d) => batch.update(d.ref, { visibility: 'visible', availability: 'available', unavailableNote: null }));
  await batch.commit();
  await revalidate(request);
}

export const formatJD = (fils: number) => {
  const v = fils / 1000;
  const s = v.toFixed(3).replace(/0$/, '');
  return `${s} JD`;
};

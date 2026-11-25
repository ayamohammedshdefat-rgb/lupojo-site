/**
 * Imports the LUPO menu (scripts/seed/lupo-menu.json) into Firestore + Storage. Idempotent:
 * docs are matched by slug; existing docs are left untouched unless --overwrite.
 *
 *   npm run seed                     # emulators (default)
 *   npm run seed -- --reset          # emulators: wipe collections + public images first
 *   npm run seed -- --overwrite      # re-apply seed fields to existing docs
 *   npm run seed:prod -- --project <id> --confirm
 *
 * Item photos are downloaded from the live site (falling back to the archived copies in
 * reference/original/site/assets) and re-encoded with sharp. The logo is the vector master
 * traced from the live site's logo (public/brand/lupo-logo.svg, see scripts/brand/logo.ts).
 */
import { readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { flag, resolveTarget } from './lib/cli';

type SeedPrice = { labelAr?: string; labelEn?: string; amountFils: number };
type SeedItem = {
  slug: string;
  icon: string;
  nameAr: string;
  nameEn: string;
  prices: SeedPrice[];
  image?: string;
  featured?: boolean;
};
type SeedSection = { slug: string; icon: string; nameAr: string; nameEn: string; order: number; items: SeedItem[] };
type Seed = { site: Record<string, unknown> & { logoUrl?: string }; sections: SeedSection[] };

const target = resolveTarget();
const overwrite = flag('overwrite');
const reset = flag('reset');

async function fetchImage(url: string): Promise<Buffer> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    const local = join('reference', 'original', 'site', 'assets', basename(new URL(url).pathname));
    console.warn(`  ! download failed (${(err as Error).message}); using archived ${local}`);
    return readFile(local);
  }
}

async function main() {
  const { adminDb, adminBucket } = await import('../src/server/firebase-admin');
  const { processImage, uploadPublicImage, uploadStaticAsset } = await import('../src/server/images');
  const { FieldValue } = await import('firebase-admin/firestore');
  const { isIconKey } = await import('../src/components/icons/keys');

  const db = adminDb();
  const seed = JSON.parse(await readFile('scripts/seed/lupo-menu.json', 'utf8')) as Seed;
  console.log(`Target: ${target.prod ? `PRODUCTION (${target.projectId})` : 'emulators (demo-lupo)'}`);

  if (reset) {
    if (target.prod) throw new Error('--reset is emulator-only');
    for (const c of ['sections', 'items', 'itemStats', 'reviews', 'reviewContacts', 'settings', 'rateLimits', 'auditLog']) {
      await db.recursiveDelete(db.collection(c));
    }
    await adminBucket().deleteFiles({ prefix: 'public/' }).catch(() => undefined);
    console.log('Reset: collections and public images cleared.');
  }

  const now = FieldValue.serverTimestamp();

  // settings/site
  const settingsRef = db.doc('settings/site');
  const settingsSnap = await settingsRef.get();
  if (!settingsSnap.exists || overwrite) {
    const svg = await readFile('public/brand/lupo-logo.svg');
    const logo = await uploadStaticAsset(svg, 'public/brand/lupo-logo.svg', 'image/svg+xml', {
      width: 1376,
      height: 404,
      alt: 'LUPO Smash Burgers',
    });
    const { logoUrl: _logoUrl, ...site } = seed.site;
    await settingsRef.set({ ...site, logo, contact: {}, updatedAt: now, updatedBy: 'seed' }, { merge: true });
    console.log('settings/site: written');
  } else {
    console.log('settings/site: exists (skipped)');
  }

  for (const section of seed.sections) {
    if (!isIconKey(section.icon)) throw new Error(`unknown icon ${section.icon}`);
    const existing = await db.collection('sections').where('slug', '==', section.slug).limit(1).get();
    const sectionRef = existing.docs[0]?.ref ?? db.collection('sections').doc();
    const sectionData = {
      slug: section.slug,
      nameAr: section.nameAr,
      nameEn: section.nameEn,
      icon: section.icon,
      order: section.order,
      visibility: 'visible',
      updatedAt: now,
    };
    if (existing.empty) await sectionRef.set({ ...sectionData, createdAt: now });
    else if (overwrite) await sectionRef.set(sectionData, { merge: true });
    console.log(`section ${section.slug}: ${existing.empty ? 'created' : overwrite ? 'updated' : 'exists'}`);

    for (const [index, item] of section.items.entries()) {
      if (!isIconKey(item.icon)) throw new Error(`unknown icon ${item.icon}`);
      const found = await db.collection('items').where('slug', '==', item.slug).limit(1).get();
      const itemRef = found.docs[0]?.ref ?? db.collection('items').doc();
      if (!found.empty && !overwrite) {
        console.log(`  item ${item.slug}: exists`);
      } else {
        let image;
        if (item.image) {
          const processed = await processImage(await fetchImage(item.image));
          image = await uploadPublicImage(processed, 'items', item.slug, `${item.nameAr} — ${item.nameEn}`);
        }
        const data = {
          slug: item.slug,
          sectionId: sectionRef.id,
          nameAr: item.nameAr,
          nameEn: item.nameEn,
          ingredients: [],
          prices: item.prices,
          badges: [],
          icon: item.icon,
          ...(image ? { image } : {}),
          featured: item.featured ?? false,
          visibility: 'visible',
          availability: 'available',
          order: index + 1,
          updatedAt: now,
          updatedBy: 'seed',
        };
        if (found.empty) await itemRef.set({ ...data, createdAt: now });
        else await itemRef.set(data, { merge: true });
        console.log(`  item ${item.slug}: ${found.empty ? 'created' : 'updated'}${image ? ' (+image)' : ''}`);
      }
      const statsRef = db.doc(`itemStats/${itemRef.id}`);
      if (!(await statsRef.get()).exists) {
        await statsRef.set({
          count: 0,
          sum: 0,
          dist: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
          approvedComments: 0,
          lastReviewAt: null,
        });
      }
    }
  }
  console.log('Done.');
}

main().then(
  () => process.exit(0),
  (err: unknown) => {
    console.error(err);
    process.exit(1);
  },
);

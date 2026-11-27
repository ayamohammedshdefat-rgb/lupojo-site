/**
 * Publishes firestore.rules + storage.rules and creates the composite indexes from
 * firestore.indexes.json, using only the Admin SDK service account (no `firebase login`, no
 * Service Usage permission needed). Production only, guarded like the other scripts:
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=<service-account.json> \
 *     tsx --conditions=react-server scripts/deploy-rules.ts --prod --project <id> --confirm
 */
import { readFile } from 'node:fs/promises';
import { arg, resolveTarget } from './lib/cli';

type IndexField = { fieldPath: string; order?: 'ASCENDING' | 'DESCENDING' };
type IndexDef = { collectionGroup: string; queryScope: 'COLLECTION' | 'COLLECTION_GROUP'; fields: IndexField[] };

const target = resolveTarget();

async function main() {
  if (!target.prod) throw new Error('deploy-rules targets production only (emulators load rules from firebase.json)');
  const { initializeApp, applicationDefault, cert } = await import('firebase-admin/app');
  const { getSecurityRules } = await import('firebase-admin/security-rules');
  const { v1 } = await import('firebase-admin/firestore');

  const bucket = arg('bucket') || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const app = initializeApp(
    { projectId: target.projectId, storageBucket: bucket, credential: keyFile ? cert(keyFile) : applicationDefault() },
    'deploy',
  );

  const rules = getSecurityRules(app);
  const fsRules = await readFile('firestore.rules', 'utf8');
  const stRules = await readFile('storage.rules', 'utf8');
  const f = await rules.releaseFirestoreRulesetFromSource(fsRules);
  console.log(`firestore.rules released (${f.name})`);
  try {
    const s = await rules.releaseStorageRulesetFromSource(stRules, bucket);
    console.log(`storage.rules released for ${bucket} (${s.name})`);
  } catch (err) {
    // Usually: Storage not enabled yet (needs the Blaze plan) or a different bucket name (--bucket).
    console.error(`storage.rules NOT released for ${bucket}: ${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = 1;
  }

  const { indexes } = JSON.parse(await readFile('firestore.indexes.json', 'utf8')) as { indexes: IndexDef[] };
  const admin = new v1.FirestoreAdminClient({ projectId: target.projectId, ...(keyFile ? { credentials: JSON.parse(await readFile(keyFile, 'utf8')) as { client_email: string; private_key: string } } : {}) });
  for (const idx of indexes) {
    const label = `${idx.collectionGroup}(${idx.fields.map((x) => `${x.fieldPath} ${x.order === 'DESCENDING' ? 'desc' : 'asc'}`).join(', ')})`;
    try {
      const [op] = await admin.createIndex({
        parent: `projects/${target.projectId}/databases/(default)/collectionGroups/${idx.collectionGroup}`,
        index: {
          queryScope: idx.queryScope,
          fields: idx.fields.map((x) => ({ fieldPath: x.fieldPath, order: x.order ?? 'ASCENDING' })),
        },
      });
      console.log(`index ${label}: creating (${op.name?.split('/').pop()})`);
    } catch (err) {
      const e = err as { code?: number; message?: string };
      if (e.code === 6) console.log(`index ${label}: already exists`);
      else throw err;
    }
  }
  await admin.close();
  console.log('Done. Indexes build in the background (usually a few minutes).');
}

main().then(
  () => process.exit(process.exitCode ?? 0),
  (err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  },
);

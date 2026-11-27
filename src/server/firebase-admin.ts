import 'server-only';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { extractServiceAccountEmail, normalizePrivateKey } from './credentials';

/**
 * Admin SDK singleton. Emulators are used whenever NEXT_PUBLIC_USE_EMULATORS=true
 * (development and tests). Production credentials, in order of preference:
 *  1. FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY_BASE64 (or the raw FIREBASE_PRIVATE_KEY PEM);
 *     small enough for Netlify/AWS Lambda's 4 KB env limit
 *  2. FIREBASE_SERVICE_ACCOUNT_BASE64 (whole service-account JSON, base64)
 *  3. Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS file, or GCP runtime)
 */
export const USE_EMULATORS = process.env.NEXT_PUBLIC_USE_EMULATORS === 'true';
export const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-lupo';
export const STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  (USE_EMULATORS ? `${PROJECT_ID}.appspot.com` : `${PROJECT_ID}.firebasestorage.app`);

if (USE_EMULATORS) {
  process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099';
  process.env.FIREBASE_STORAGE_EMULATOR_HOST ||= '127.0.0.1:9199';
  // No real credentials locally: don't probe the GCE metadata server (avoids timeouts and warnings).
  process.env.METADATA_SERVER_DETECTION ||= 'none';
}

type AdminGlobal = { __lupoAdmin?: { app: App; db: Firestore } };
const g = globalThis as AdminGlobal;

function credentialOptions() {
  if (USE_EMULATORS) return {};
  const rawEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  // A base64 key is paste-proof (one line, no special characters), so it wins when present.
  const keyB64 = process.env.FIREBASE_PRIVATE_KEY_BASE64?.trim();
  const keyVar = keyB64 ? 'FIREBASE_PRIVATE_KEY_BASE64' : 'FIREBASE_PRIVATE_KEY';
  const privateKey = keyB64 ? Buffer.from(keyB64, 'base64').toString('utf8') : process.env.FIREBASE_PRIVATE_KEY;
  if (rawEmail && privateKey) {
    const clientEmail = extractServiceAccountEmail(rawEmail);
    if (!clientEmail) {
      // Never print values: only shape hints, so a swapped or truncated value is easy to spot.
      throw new Error(
        `FIREBASE_CLIENT_EMAIL does not contain exactly one service-account email (length ${rawEmail.length}, ` +
          `'@' ${rawEmail.includes('@') ? 'present' : 'missing'}, ` +
          `'.iam.gserviceaccount.com' ${rawEmail.includes('.iam.gserviceaccount.com') ? 'present' : 'missing'}). ` +
          'Use the client_email value from the service-account JSON.',
      );
    }
    try {
      return { credential: cert({ projectId: PROJECT_ID, clientEmail, privateKey: normalizePrivateKey(privateKey) }) };
    } catch (err) {
      const hasMarker = /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(privateKey);
      throw new Error(
        `${keyVar} could not be parsed (${err instanceof Error ? err.message.split('\n')[0] : 'invalid key'}; ` +
          `decoded length ${privateKey.length}, PEM header ${hasMarker ? 'present' : 'missing'}). ` +
          'Set it again from the private_key value of the service-account JSON.',
      );
    }
  }
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!b64) return {}; // Falls back to Application Default Credentials (e.g. on GCP).
  const json = JSON.parse(Buffer.from(b64, 'base64').toString('utf8')) as {
    project_id: string;
    client_email: string;
    private_key: string;
  };
  return { credential: cert({ projectId: json.project_id, clientEmail: json.client_email, privateKey: json.private_key }) };
}

function init() {
  if (g.__lupoAdmin) return g.__lupoAdmin;
  const app =
    getApps().find((a) => a.name === 'lupo') ??
    initializeApp({ projectId: PROJECT_ID, storageBucket: STORAGE_BUCKET, ...credentialOptions() }, 'lupo');
  const db = getFirestore(app);
  db.settings({ ignoreUndefinedProperties: true });
  g.__lupoAdmin = { app, db };
  return g.__lupoAdmin;
}

export function adminDb(): Firestore {
  return init().db;
}

export function adminAuth(): Auth {
  return getAuth(init().app);
}

export function adminBucket() {
  return getStorage(init().app).bucket(STORAGE_BUCKET);
}

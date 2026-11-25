import 'server-only';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

/**
 * Admin SDK singleton. Emulators are used whenever NEXT_PUBLIC_USE_EMULATORS=true
 * (development and tests); production reads FIREBASE_SERVICE_ACCOUNT_BASE64.
 */
export const USE_EMULATORS = process.env.NEXT_PUBLIC_USE_EMULATORS === 'true';
export const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-lupo';
export const STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${PROJECT_ID}.appspot.com`;

if (USE_EMULATORS) {
  process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099';
  process.env.FIREBASE_STORAGE_EMULATOR_HOST ||= '127.0.0.1:9199';
}

type AdminGlobal = { __lupoAdmin?: { app: App; db: Firestore } };
const g = globalThis as AdminGlobal;

function credentialOptions() {
  if (USE_EMULATORS) return {};
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

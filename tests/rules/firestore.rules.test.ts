import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { afterAll, beforeAll, describe, it } from 'vitest';

let env: RulesTestEnvironment;

const COLLECTIONS = ['sections', 'items', 'itemStats', 'reviews', 'settings', 'reviewContacts', 'auditLog', 'rateLimits'];

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-lupo-rules',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    for (const c of COLLECTIONS) await setDoc(doc(db, c, 'x'), { seeded: true });
  });
});

afterAll(async () => {
  await env?.cleanup();
});

const anon = () => env.unauthenticatedContext().firestore();
const noRole = () => env.authenticatedContext('u-none', {}).firestore();
const staff = () => env.authenticatedContext('u-staff', { role: 'staff' }).firestore();
const owner = () => env.authenticatedContext('u-owner', { role: 'owner' }).firestore();

describe('unauthenticated clients', () => {
  it.each(COLLECTIONS)('cannot read or write %s', async (c) => {
    await assertFails(getDoc(doc(anon(), c, 'x')));
    await assertFails(getDocs(collection(anon(), c)));
    await assertFails(setDoc(doc(anon(), c, 'y'), { a: 1 }));
  });
});

describe('signed-in users without a role', () => {
  it.each(COLLECTIONS)('are denied on %s', async (c) => {
    await assertFails(getDoc(doc(noRole(), c, 'x')));
    await assertFails(setDoc(doc(noRole(), c, 'y'), { a: 1 }));
  });
});

describe('staff', () => {
  it.each(['sections', 'items', 'itemStats', 'reviews', 'settings'])('can read %s', async (c) => {
    await assertSucceeds(getDoc(doc(staff(), c, 'x')));
  });
  it('cannot read reviewContacts, auditLog or rateLimits', async () => {
    await assertFails(getDoc(doc(staff(), 'reviewContacts', 'x')));
    await assertFails(getDoc(doc(staff(), 'auditLog', 'x')));
    await assertFails(getDoc(doc(staff(), 'rateLimits', 'x')));
  });
});

describe('owner', () => {
  it('can read reviewContacts and auditLog', async () => {
    await assertSucceeds(getDoc(doc(owner(), 'reviewContacts', 'x')));
    await assertSucceeds(getDoc(doc(owner(), 'auditLog', 'x')));
  });
  it('still cannot read rateLimits', async () => {
    await assertFails(getDoc(doc(owner(), 'rateLimits', 'x')));
  });
});

describe('nobody writes from a client', () => {
  it.each(COLLECTIONS)('%s rejects create, update and delete for every role', async (c) => {
    for (const db of [anon(), noRole(), staff(), owner()]) {
      await assertFails(setDoc(doc(db, c, 'new'), { a: 1 }));
      await assertFails(setDoc(doc(db, c, 'x'), { a: 2 }, { merge: true }));
      await assertFails(deleteDoc(doc(db, c, 'x')));
    }
  });
});

import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { getBytes, ref, uploadString } from 'firebase/storage';
import { afterAll, beforeAll, describe, it } from 'vitest';

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-lupo-rules',
    storage: { rules: readFileSync('storage.rules', 'utf8') },
  });
  await env.withSecurityRulesDisabled(async (ctx) => {
    await uploadString(ref(ctx.storage(), 'public/items/a.txt'), 'img');
    await uploadString(ref(ctx.storage(), 'private/b.txt'), 'secret');
  });
});

afterAll(async () => {
  await env?.cleanup();
});

describe('storage rules', () => {
  it('anyone can read public images', async () => {
    await assertSucceeds(getBytes(ref(env.unauthenticatedContext().storage(), 'public/items/a.txt')));
  });
  it('nothing else is readable', async () => {
    await assertFails(getBytes(ref(env.authenticatedContext('o', { role: 'owner' }).storage(), 'private/b.txt')));
  });
  it('no client can upload, not even the owner', async () => {
    for (const ctx of [env.unauthenticatedContext(), env.authenticatedContext('o', { role: 'owner' })]) {
      await assertFails(uploadString(ref(ctx.storage(), 'public/items/new.txt'), 'x'));
      await assertFails(uploadString(ref(ctx.storage(), 'private/new.txt'), 'x'));
    }
  });
});

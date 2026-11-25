import { defineConfig } from 'vitest/config';

/** Security-rules tests. Run through `npm run test:rules` (inside `firebase emulators:exec`). */
export default defineConfig({
  test: {
    include: ['tests/rules/**/*.test.ts'],
    environment: 'node',
    testTimeout: 20_000,
    hookTimeout: 30_000,
    fileParallelism: false,
    // Defaults match firebase.json, so the suite also runs against already-running emulators.
    env: {
      FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080',
      FIREBASE_STORAGE_EMULATOR_HOST: process.env.FIREBASE_STORAGE_EMULATOR_HOST ?? '127.0.0.1:9199',
    },
  },
});

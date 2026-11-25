import { defineConfig } from 'vitest/config';

/** Security-rules tests. Run through `npm run test:rules` (inside `firebase emulators:exec`). */
export default defineConfig({
  test: {
    include: ['tests/rules/**/*.test.ts'],
    environment: 'node',
    testTimeout: 20_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
});

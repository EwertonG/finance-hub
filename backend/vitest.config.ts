import { defineConfig } from 'vitest/config';
import { testEnv } from './tests/setup/test-env.js';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globalSetup: ['tests/setup/global-setup.ts'],
    env: testEnv,
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});

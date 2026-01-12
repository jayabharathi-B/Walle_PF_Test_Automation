import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.setup.ts'],
  use: {
    headless: false,
  },
});

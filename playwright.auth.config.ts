import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/google.setup.ts'],
  use: {
    headless: false,
  },
});

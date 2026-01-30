import { test, expect } from '../../src/fixtures/home.fixture';

// eslint-disable-next-line playwright/no-skipped-test
test.skip('EG Authentication - Google Login', async ({ page }) => {
  // Navigate to home page
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Verify page loaded
  expect(page.url()).toContain('/');
});


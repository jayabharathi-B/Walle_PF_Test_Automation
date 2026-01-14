import { test, expect } from '../../src/fixtures/home.fixture';

// Use authentication storage state from Google login
test.use({
  storageState: 'auth/google.json',
});

test('EG Authentication - Google Login', async ({ page, home, authenticatedHeader }) => {
  // Navigate to home page
  await page.goto('/');
  await page.waitForLoadState('networkidle');   

 // await expect(page.getByText('Welcome')).toBeVisible();
});


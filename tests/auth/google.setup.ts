import { test as setup } from '@playwright/test';
//import test from  '../../src/fixtures/home.fixture';


//test.use({
//  storageState: 'auth/google.json',
//});

setup('Google auth setup', async ({ page }) => {
  await page.goto('https://aistg.walle.xyz/');

  // 3. ⛔ PAUSE the test here
  // You will manually complete Google login
  await page.pause();

  // 4. After you resume, test will continue
  await page.waitForLoadState('networkidle');

  // 5. SAVE auth state
  await page.context().storageState({
    path: 'auth/google.json',
  });
});

import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

type Fixtures = {
  home: HomePage;
};

export const test = base.extend<Fixtures>({
  home: async ({ page }, use) => {
    const home = new HomePage(page);

    // 🔥 Force clean state before every test
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await use(home);
  },
});

export { expect } from '@playwright/test';

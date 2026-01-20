import { test as setup } from '@playwright/test';
import { refreshAuthTokensViaBrowser } from '../utils/token-refresh';

setup('Refresh authentication tokens', async ({ browser }) => {
  console.log('auth refresh: start');

  try {
    await refreshAuthTokensViaBrowser(browser);
    console.log('auth refresh: complete');
  } catch (error) {
    console.error(
      'auth refresh: failed; authenticated tests will be skipped:',
      (error as Error).message
    );
    throw error; // Fail fast - stop authenticated tests
  }
});

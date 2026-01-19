import { test as setup } from '@playwright/test';
import { refreshAuthTokensViaBrowser } from '../utils/token-refresh';

setup('Refresh authentication tokens', async ({ browser }) => {
  console.log('Refreshing authentication tokens for authenticated tests...');

  try {
    await refreshAuthTokensViaBrowser(browser);
    console.log('✓ Tokens refreshed successfully');
  } catch (error) {
    console.error('✗ Failed to refresh tokens:', (error as Error).message);
    throw error; // Fail fast - stop authenticated tests
  }
});

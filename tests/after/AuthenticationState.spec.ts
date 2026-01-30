/* eslint-disable max-lines-per-function */
import { test, expect } from '../../src/fixtures/home.fixture';
import type { AuthenticatedHeader } from '../../src/pages/AuthenticatedHeader';
import type { HomePage } from '../../src/pages/HomePage';

// Note: storageState is configured in playwright.config.ts for authenticated-tests project

// HEALER FIX (2026-01-30): Increased timeout and improved auth state detection
// Root cause: When running with parallel workers, auth storage state may take longer to restore
// Resolution: Wait for network idle first, increase timeout to 30s, add initial wait for page load
async function waitForAuthState(
  authenticatedHeader: AuthenticatedHeader,
  home: HomePage,
  timeoutMs: number = 30000
) {
  // Wait for page to stabilize before checking auth state
  await home.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    // Check for wallet address button (authenticated state)
    try {
      if (await authenticatedHeader.walletAddressButton.isVisible({ timeout: 1000 })) {
        return 'authenticated';
      }
    } catch {
      // Element not found yet, continue polling
    }

    // Only return unauthenticated after giving sufficient time for auth to load
    const elapsed = timeoutMs - (deadline - Date.now());
    if (elapsed > 10000) {
      // After 10 seconds, start checking for connect wallet button
      try {
        if (await home.connectWalletHeaderBtn.isVisible({ timeout: 500 })) {
          return 'unauthenticated';
        }
      } catch {
        // Element not found, continue polling
      }
    }

    await home.page.waitForTimeout(500);
  }
  return 'unknown';
}

test.describe('Authentication State - Wallet Button', () => {
  test('should display wallet address in header after authentication', async ({ page, authenticatedHeader, home }) => {
    // HEALER FIX (2026-01-20): Avoid default "load" wait which can hang on heavy pages.
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for auth state to load and wallet button to appear
    const authState = await waitForAuthState(authenticatedHeader, home);
    if (authState !== 'authenticated') {
      throw new Error('Authentication state is unauthenticated or unknown. Refresh auth state before running this test.');
    }

    // Verify wallet button shows truncated address format: 0x{4chars}...{4chars}
    const displayedAddress = await authenticatedHeader.getWalletAddress();
    expect(displayedAddress).toMatch(/^0x[a-fA-F0-9]{4}\.\.\.[a-fA-F0-9]{4}$/);

    // Verify CONNECT WALLET button is not visible
    await expect(home.connectWalletHeaderBtn).toBeHidden();

    // Verify user is authenticated
    expect(await authenticatedHeader.isAuthenticated()).toBe(true);
  });

  test('should open dropdown when clicking wallet address button', async ({ page, authenticatedHeader, home }) => {
    // HEALER FIX (2026-01-20): Avoid default "load" wait which can hang on heavy pages.
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for wallet button to be visible
    const authState = await waitForAuthState(authenticatedHeader, home);
    if (authState !== 'authenticated') {
      throw new Error('Authentication state is unauthenticated or unknown. Refresh auth state before running this test.');
    }

    // Verify dropdown is not open initially
    expect(await authenticatedHeader.isDropdownOpen()).toBe(false);

    // Open dropdown
    await authenticatedHeader.openWalletDropdown();

    // Verify dropdown is visible
    expect(await authenticatedHeader.isDropdownOpen()).toBe(true);
    await expect(authenticatedHeader.walletDropdown).toBeVisible();
  });

  test('should have disconnect option in dropdown', async ({ page, authenticatedHeader, home }) => {
    // HEALER FIX (2026-01-20): Avoid default "load" wait which can hang on heavy pages.
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for wallet button to be visible
    const authState = await waitForAuthState(authenticatedHeader, home);
    if (authState !== 'authenticated') {
      throw new Error('Authentication state is unauthenticated or unknown. Refresh auth state before running this test.');
    }

    // Open dropdown
    await authenticatedHeader.openWalletDropdown();

    // Verify disconnect option exists and is visible
    await expect(authenticatedHeader.disconnectButton).toBeVisible();

    // Verify disconnect button has correct text
    const disconnectText = await authenticatedHeader.disconnectButton.textContent();
    expect(disconnectText).toContain('Disconnect');
  });

  test('should logout when clicking disconnect', async ({ page, authenticatedHeader, home }) => {
    // HEALER FIX (2026-01-20): Avoid default "load" wait which can hang on heavy pages.
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for wallet button to be visible
    const authState = await waitForAuthState(authenticatedHeader, home);
    if (authState !== 'authenticated') {
      throw new Error('Authentication state is unauthenticated or unknown. Refresh auth state before running this test.');
    }

    // Verify authenticated state before disconnect
    expect(await authenticatedHeader.isAuthenticated()).toBe(true);
    await expect(home.connectWalletHeaderBtn).toBeHidden();

    // Open dropdown and disconnect
    await authenticatedHeader.openWalletDropdown();
    await authenticatedHeader.clickDisconnect();

    // Wait for unauthenticated state after disconnect
    await expect.poll(
      async () => await home.connectWalletHeaderBtn.isVisible(),
      { timeout: 10000, intervals: [500, 1000, 2000] }
    ).toBe(true);
    await expect(authenticatedHeader.walletAddressButton).toBeHidden({ timeout: 10000 });
    expect(await authenticatedHeader.isAuthenticated()).toBe(false);
  });

  test('should close dropdown when clicking outside', async ({ page, authenticatedHeader, home }) => {
    // HEALER FIX (2026-01-20): Avoid default "load" wait which can hang on heavy pages.
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for wallet button to be visible
    const authState = await waitForAuthState(authenticatedHeader, home);
    if (authState !== 'authenticated') {
      throw new Error('Authentication state is unauthenticated or unknown. Refresh auth state before running this test.');
    }

    // Open dropdown
    await authenticatedHeader.openWalletDropdown();
    expect(await authenticatedHeader.isDropdownOpen()).toBe(true);

    // Close dropdown by clicking outside
    await authenticatedHeader.closeDropdown();

    // Verify dropdown is hidden
    expect(await authenticatedHeader.isDropdownOpen()).toBe(false);
    await expect(authenticatedHeader.walletDropdown).toBeHidden();
  });

  test('should maintain authenticated state on page reload', async ({ page, authenticatedHeader, home }) => {
    // HEALER FIX (2026-01-20): Avoid default "load" wait which can hang on heavy pages.
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for wallet button to be visible
    const authState = await waitForAuthState(authenticatedHeader, home);
    if (authState !== 'authenticated') {
      throw new Error('Authentication state is unauthenticated or unknown. Refresh auth state before running this test.');
    }

    // Verify authenticated initially
    expect(await authenticatedHeader.isAuthenticated()).toBe(true);
    const addressBefore = await authenticatedHeader.getWalletAddress();

    // Reload page
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Wait for wallet button to appear again after reload
    const authStateAfterReload = await waitForAuthState(authenticatedHeader, home);
    if (authStateAfterReload !== 'authenticated') {
      throw new Error('Authentication state is unauthenticated or unknown after reload. Refresh auth state before running this test.');
    }

    // Verify still authenticated after reload
    expect(await authenticatedHeader.isAuthenticated()).toBe(true);
    const addressAfter = await authenticatedHeader.getWalletAddress();

    // Verify same wallet address is displayed
    expect(addressAfter).toBe(addressBefore);
  });
});

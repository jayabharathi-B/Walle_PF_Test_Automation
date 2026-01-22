/* eslint-disable max-lines-per-function */
import { test, expect } from '../../src/fixtures/home.fixture';

// Note: storageState is configured in playwright.config.ts for authenticated-tests project

test.describe('Authentication State - Wallet Button', () => {
  test('should display wallet address in header after authentication', async ({ page, authenticatedHeader, home }) => {
    // HEALER FIX (2026-01-20): Avoid default "load" wait which can hang on heavy pages.
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for auth state to load and wallet button to appear
    await expect(authenticatedHeader.walletAddressButton).toBeVisible({ timeout: 15000 });

    // Verify wallet button shows truncated address format: 0x{4chars}...{4chars}
    const displayedAddress = await authenticatedHeader.getWalletAddress();
    expect(displayedAddress).toMatch(/^0x[a-fA-F0-9]{4}\.\.\.[a-fA-F0-9]{4}$/);

    // Verify CONNECT WALLET button is not visible
    await expect(home.connectWalletHeaderBtn).toBeHidden();

    // Verify user is authenticated
    expect(await authenticatedHeader.isAuthenticated()).toBe(true);
  });

  test('should open dropdown when clicking wallet address button', async ({ page, authenticatedHeader }) => {
    // HEALER FIX (2026-01-20): Avoid default "load" wait which can hang on heavy pages.
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for wallet button to be visible
    await expect(authenticatedHeader.walletAddressButton).toBeVisible({ timeout: 15000 });

    // Verify dropdown is not open initially
    expect(await authenticatedHeader.isDropdownOpen()).toBe(false);

    // Open dropdown
    await authenticatedHeader.openWalletDropdown();

    // Verify dropdown is visible
    expect(await authenticatedHeader.isDropdownOpen()).toBe(true);
    await expect(authenticatedHeader.walletDropdown).toBeVisible();
  });

  test('should have disconnect option in dropdown', async ({ page, authenticatedHeader }) => {
    // HEALER FIX (2026-01-20): Avoid default "load" wait which can hang on heavy pages.
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for wallet button to be visible
    await expect(authenticatedHeader.walletAddressButton).toBeVisible({ timeout: 15000 });

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
    await expect(authenticatedHeader.walletAddressButton).toBeVisible({ timeout: 15000 });

    // Verify authenticated state before disconnect
    expect(await authenticatedHeader.isAuthenticated()).toBe(true);
    await expect(home.connectWalletHeaderBtn).toBeHidden();

    // Open dropdown and disconnect
    await authenticatedHeader.openWalletDropdown();
    await authenticatedHeader.clickDisconnect();

    // Wait for wallet button to disappear
    await expect(authenticatedHeader.walletAddressButton).toBeHidden({ timeout: 10000 });

    // Verify unauthenticated state after disconnect
    await expect(home.connectWalletHeaderBtn).toBeVisible({ timeout: 10000 });
    expect(await authenticatedHeader.isAuthenticated()).toBe(false);
  });

  test('should close dropdown when clicking outside', async ({ page, authenticatedHeader }) => {
    // HEALER FIX (2026-01-20): Avoid default "load" wait which can hang on heavy pages.
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for wallet button to be visible
    await expect(authenticatedHeader.walletAddressButton).toBeVisible({ timeout: 15000 });

    // Open dropdown
    await authenticatedHeader.openWalletDropdown();
    expect(await authenticatedHeader.isDropdownOpen()).toBe(true);

    // Close dropdown by clicking outside
    await authenticatedHeader.closeDropdown();

    // Verify dropdown is hidden
    expect(await authenticatedHeader.isDropdownOpen()).toBe(false);
    await expect(authenticatedHeader.walletDropdown).toBeHidden();
  });

  test('should maintain authenticated state on page reload', async ({ page, authenticatedHeader }) => {
    // HEALER FIX (2026-01-20): Avoid default "load" wait which can hang on heavy pages.
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for wallet button to be visible
    await expect(authenticatedHeader.walletAddressButton).toBeVisible({ timeout: 15000 });

    // Verify authenticated initially
    expect(await authenticatedHeader.isAuthenticated()).toBe(true);
    const addressBefore = await authenticatedHeader.getWalletAddress();

    // Reload page
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Wait for wallet button to appear again after reload
    await expect(authenticatedHeader.walletAddressButton).toBeVisible({ timeout: 15000 });

    // Verify still authenticated after reload
    expect(await authenticatedHeader.isAuthenticated()).toBe(true);
    const addressAfter = await authenticatedHeader.getWalletAddress();

    // Verify same wallet address is displayed
    expect(addressAfter).toBe(addressBefore);
  });
});

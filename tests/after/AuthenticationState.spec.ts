import { test, expect } from '../../src/fixtures/home.fixture';

// Use authentication storage state from Google login
test.use({
  storageState: 'auth/google.json',
});

test.describe('Authentication State - Wallet Button', () => {
  const expectedWalletAddress = '0x6c0F0DEF4cA61BdF03C1AB60667f5A73A4f552D6';

  test('should display wallet address in header after authentication', async ({ page, authenticatedHeader, home }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify wallet button shows truncated address
    const displayedAddress = await authenticatedHeader.getWalletAddress();
    expect(displayedAddress).toMatch(/0x[a-fA-F0-9]{4}\.\.\.[a-fA-F0-9]{4}/);
    expect(displayedAddress).toContain('0x6c0F');
    expect(displayedAddress).toContain('52D6');

    // Verify CONNECT WALLET button is not visible
    await expect(home.connectWalletHeaderBtn).toBeHidden();

    // Verify user is authenticated
    expect(await authenticatedHeader.isAuthenticated()).toBe(true);
  });

  test('should open dropdown when clicking wallet address button', async ({ page, authenticatedHeader }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify dropdown is not open initially
    expect(await authenticatedHeader.isDropdownOpen()).toBe(false);

    // Open dropdown
    await authenticatedHeader.openWalletDropdown();

    // Verify dropdown is visible
    expect(await authenticatedHeader.isDropdownOpen()).toBe(true);
    await expect(authenticatedHeader.walletDropdown).toBeVisible();
  });

  test('should have disconnect option in dropdown', async ({ page, authenticatedHeader }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open dropdown
    await authenticatedHeader.openWalletDropdown();

    // Verify disconnect option exists and is visible
    await expect(authenticatedHeader.disconnectButton).toBeVisible();

    // Verify disconnect button has correct text
    const disconnectText = await authenticatedHeader.disconnectButton.textContent();
    expect(disconnectText).toContain('Disconnect');
  });

  test('should logout when clicking disconnect', async ({ page, authenticatedHeader, home }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify authenticated state before disconnect
    expect(await authenticatedHeader.isAuthenticated()).toBe(true);
    await expect(home.connectWalletHeaderBtn).toBeHidden();

    // Open dropdown and disconnect
    await authenticatedHeader.openWalletDropdown();
    await authenticatedHeader.clickDisconnect();

    // Wait for logout to complete - disconnect might trigger async operations
    await page.waitForTimeout(2000); // Wait for disconnect to process
    await page.waitForLoadState('networkidle');

    // Wait for wallet button to disappear
    await expect(authenticatedHeader.walletAddressButton).toBeHidden({ timeout: 10000 });

    // Verify unauthenticated state after disconnect
    await expect(home.connectWalletHeaderBtn).toBeVisible({ timeout: 10000 });
    expect(await authenticatedHeader.isAuthenticated()).toBe(false);
  });

  test('should close dropdown when clicking outside', async ({ page, authenticatedHeader }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

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
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify authenticated initially
    expect(await authenticatedHeader.isAuthenticated()).toBe(true);
    const addressBefore = await authenticatedHeader.getWalletAddress();

    // Reload page
    await page.reload({ waitUntil: 'networkidle' });

    // Verify still authenticated after reload
    expect(await authenticatedHeader.isAuthenticated()).toBe(true);
    const addressAfter = await authenticatedHeader.getWalletAddress();

    // Verify same wallet address is displayed
    expect(addressAfter).toBe(addressBefore);
  });
});

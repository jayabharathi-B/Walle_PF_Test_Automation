import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AuthenticatedHeader extends BasePage {
  readonly walletAddressButton: Locator;
  readonly walletDropdown: Locator;
  readonly disconnectButton: Locator;
  readonly creditsButton: Locator;
  readonly copyAddressButton: Locator;

  constructor(page: Page) {
    super(page);

    // Wallet address button showing truncated address (e.g., "0x6c0F...52D6")
    this.walletAddressButton = page.getByTestId('main-header-profile-btn');

    // Dropdown container that appears after clicking wallet button
    this.walletDropdown = page.getByTestId('main-header-profile-menu');

    // Disconnect wallet button in dropdown
    this.disconnectButton = page.getByTestId('main-header-profile-disconnect-btn');

    // Credits button in header
    this.creditsButton = page.getByTestId('credits-button');

    // Copy address button in dropdown
    this.copyAddressButton = page.getByTestId('main-header-profile-copy-btn');
  }

  /**
   * Get the displayed wallet address text from the button
   * @returns The truncated wallet address (e.g., "0x6c0F...52D6")
   */
  async getWalletAddress(): Promise<string> {
    return (await this.walletAddressButton.textContent()) || '';
  }

  /**
   * Open the wallet dropdown by clicking the wallet address button
   */
  async openWalletDropdown() {
    await this.walletAddressButton.click();
    await this.walletDropdown.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Click the disconnect button in the dropdown
   * This will log the user out and return to unauthenticated state
   */
  async clickDisconnect() {
    await this.disconnectButton.click();
  }

  /**
   * Check if user is in authenticated state
   * @returns true if wallet button is visible, false otherwise
   */
  async isAuthenticated(): Promise<boolean> {
    return await this.walletAddressButton.isVisible().catch(() => false);
  }

  /**
   * Check if dropdown is currently open
   * @returns true if dropdown is visible, false otherwise
   */
  async isDropdownOpen(): Promise<boolean> {
    return await this.walletDropdown.isVisible().catch(() => false);
  }

  /**
   * Close the dropdown by clicking outside of it
   */
  async closeDropdown() {
    // Click on the page body to close dropdown
    await this.page.locator('body').click({ position: { x: 100, y: 100 } });
    await this.walletDropdown.waitFor({ state: 'hidden', timeout: 5000 });
  }
}

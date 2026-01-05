import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ConnectModal extends BasePage {
  readonly connectToContinueText: Locator;
  readonly connectWalletBtn: Locator;
  readonly loginWithGoogleBtn: Locator;
  readonly loginWithXBtn: Locator;
  readonly modal: Locator;
  readonly closeBtn: Locator;
  readonly backBtn: Locator;
  readonly newToWalletsText: Locator;

  constructor(page: Page) {
    super(page);

    this.modal = page.locator('.fixed.inset-0');
    this.connectToContinueText = page.getByRole('heading', { name: 'Connect  to Continue' });
    this.connectWalletBtn = page.getByRole('button', { name: 'Connect a Wallet' });
    this.loginWithGoogleBtn = page.getByRole('button', { name: 'Login with google' });
    this.loginWithXBtn = page.getByRole('button', { name: 'Login with x' });
    this.closeBtn = this.modal.locator('button:has(svg)').first();
    this.backBtn = page.getByText('Back');
    this.newToWalletsText = page.getByText(/new to wallets\\?/i);
  }

  async isVisible(): Promise<boolean> {
    return await this.modal.isVisible().catch(() => false);
  }

  async waitForModal() {
    await expect(this.connectToContinueText).toBeVisible({ timeout: 10000 });
  }

  async clickConnectWallet() {
    await this.connectWalletBtn.click();
  }

  async close() {
    if (await this.isVisible()) {
      await this.closeBtn.click();
      await expect(this.modal).not.toBeAttached();
    }
  }

  async closeIfVisible() {
    if (await this.connectToContinueText.count()) {
      await expect(this.connectToContinueText).toBeVisible();
      await this.close();
    }
  }
}

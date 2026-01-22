import { Page, Locator } from '@playwright/test';
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

    this.modal = page.getByTestId('connect-wallet-modal');
    this.connectToContinueText = page.getByTestId('connect-wallet-modal-title');
    this.connectWalletBtn = page.getByRole('button', { name: 'Connect a Wallet' });
    this.loginWithGoogleBtn = page.getByRole('button', { name: 'Login with google' });
    this.loginWithXBtn = page.getByRole('button', { name: 'Login with x' });
    this.closeBtn = page.getByTestId('connect-wallet-modal-close-btn');
    this.backBtn = page.getByText('Back');
    this.newToWalletsText = page.getByText(/new to wallets\?/i);
  }

  async isVisible(): Promise<boolean> {
    return await this.modal.isVisible().catch(() => false);
  }

  async waitForModal() {
    await this.connectToContinueText.waitFor({ state: 'visible', timeout: 10000 });
  }

  async clickConnectWallet() {
    await this.connectWalletBtn.click();
  }

  async close() {
    if (await this.isVisible()) {
      await this.closeBtn.click();
      await this.modal.waitFor({ state: 'detached', timeout: 5000 });
    }
  }

  async closeIfVisible() {
    if (await this.connectToContinueText.count()) {
      await this.connectToContinueText.waitFor({ state: 'visible', timeout: 5000 });
      await this.close();
    }
  }
}

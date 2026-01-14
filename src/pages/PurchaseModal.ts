import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class PurchaseModal extends BasePage {
  // ---------- Modal Container ----------
  readonly modal: Locator;
  readonly modalHeading: Locator;
  readonly closeButton: Locator;

  // ---------- Tabs ----------
  readonly externalDepositTab: Locator;
  readonly transferTab: Locator;

  // ---------- External Deposit Tab Content ----------
  readonly depositAddressLabel: Locator;
  readonly depositAddressValue: Locator;
  readonly copyAddressButton: Locator;

  readonly currentBalanceHeading: Locator;
  readonly usdcBalanceLabel: Locator;
  readonly usdcBalanceValue: Locator;
  readonly refreshBalanceButton: Locator;

  readonly networkWarningMessage: Locator;
  readonly insufficientBalanceMessage: Locator;

  readonly haveTheFundsButton: Locator;
  readonly buyViaThirdwebButton: Locator;

  // ---------- Transfer Tab Content (PLACEHOLDERS) ----------
  // TODO: Scout Transfer tab elements to replace these placeholders
  // Transfer tab was not fully scouted - these are estimated locators
  readonly transferFromLabel: Locator;
  readonly transferToLabel: Locator;
  readonly transferAmountInput: Locator;
  readonly transferButton: Locator;

  constructor(page: Page) {
    super(page);

    // ---------- Modal Container ----------
    this.modal = page.getByText(/setup a deposit account|fund your deposit account/i).locator('../..');
    this.modalHeading = page.locator('text=/setup a deposit account|fund your deposit account/i');
    this.closeButton = page.getByTestId('funding-modal-close');

    // ---------- Tabs ----------
    this.externalDepositTab = page.getByTestId('external-deposit-tab');
    this.transferTab = page.getByTestId('transfer-tab');

    // ---------- External Deposit Tab Content ----------
    this.depositAddressLabel = page.getByText(/deposit address.*base chain/i);
    this.depositAddressValue = this.modal.locator('input[readonly]').first();
    this.copyAddressButton = page.getByTestId('copy-address-button');

    this.currentBalanceHeading = page.getByText('Current Balance');
    this.usdcBalanceLabel = page.getByText('USDC Balance');
    this.usdcBalanceValue = page.getByTestId('usdc-balance-amount');
    this.refreshBalanceButton = page.getByTestId('external-balance-refresh-button');

    this.networkWarningMessage = page.getByTestId('external-deposit-warning');
    this.insufficientBalanceMessage = page.getByTestId('insufficient-balance-error');

    this.haveTheFundsButton = page.getByTestId('i-have-funds-button');
    this.buyViaThirdwebButton = page.getByTestId('buy-thirdweb-button');

    // ---------- Transfer Tab Content (PLACEHOLDERS) ----------
    // TODO: Scout these elements when Transfer tab is clicked
    // These are placeholder locators based on expected patterns
    this.transferFromLabel = this.modal.getByText(/^from$/i);
    this.transferToLabel = this.modal.getByText(/^to$/i);
    this.transferAmountInput = this.modal.locator('input[type="number"]');
    this.transferButton = this.modal.getByRole('button', { name: /^transfer$/i });
  }

  // ---------- Modal Actions ----------
  async waitForModal() {
    await expect(this.modal).toBeVisible({ timeout: 5000 });
  }

  async close() {
    await this.closeButton.click();
    await expect(this.modal).toBeHidden({ timeout: 5000 });
  }

  // ---------- Tab Actions ----------
  async clickExternalDepositTab() {
    await this.externalDepositTab.click();
    await expect(this.depositAddressLabel).toBeVisible();
  }

  async clickTransferTab() {
    await this.transferTab.click();
    // TODO: Add proper wait for Transfer tab content after scouting
    await this.page.waitForTimeout(500);
  }

  // ---------- External Deposit Actions ----------
  async getDepositAddress(): Promise<string> {
    return await this.depositAddressValue.inputValue() || '';
  }

  async clickCopyAddress() {
    await this.copyAddressButton.click();
  }

  async clickRefreshBalance() {
    await this.refreshBalanceButton.click();
  }

  async getUsdcBalance(): Promise<string> {
    return await this.usdcBalanceValue.textContent() || '';
  }

  async clickBuyViaThirdweb() {
    await this.buyViaThirdwebButton.click();
  }

  // ---------- Transfer Actions (PLACEHOLDERS) ----------
  // TODO: Implement these methods after Transfer tab scouting
  async enterTransferAmount(amount: string) {
    await this.transferAmountInput.fill(amount);
  }

  async clickTransferButton() {
    await this.transferButton.click();
  }

  async isTransferButtonEnabled(): Promise<boolean> {
    return !(await this.transferButton.isDisabled());
  }

  // ---------- Helpers ----------
  async isErrorMessageVisible(): Promise<boolean> {
    return await this.insufficientBalanceMessage.isVisible().catch(() => false);
  }

  async getErrorMessage(): Promise<string> {
    if (await this.isErrorMessageVisible()) {
      return await this.insufficientBalanceMessage.textContent() || '';
    }
    return '';
  }
}

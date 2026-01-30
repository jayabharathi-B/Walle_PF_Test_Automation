import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class PurchaseModal extends BasePage {
  // ---------- Modal Container ----------
  readonly modal: Locator;
  readonly modalHeading: Locator;
  readonly closeButton: Locator;
  readonly createAccountButton: Locator;

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
    this.modal = page.getByTestId('deposit-setup-modal').or(page.getByTestId('funding-modal'));
    this.modalHeading = page.getByTestId('funding-modal-heading').or(page.getByTestId('deposit-setup-heading'));
    this.closeButton = page.getByTestId('funding-modal-close');
    this.createAccountButton = page.getByRole('button', { name: /create account/i });

    // ---------- Tabs ----------
    this.externalDepositTab = page.getByTestId('external-deposit-tab');
    this.transferTab = page.getByTestId('transfer-tab');

    // ---------- External Deposit Tab Content ----------
    this.depositAddressLabel = page.getByTestId('deposit-address-label');
    this.depositAddressValue = page.getByTestId('deposit-address-input');
    this.copyAddressButton = page.getByTestId('copy-address-button');

    this.currentBalanceHeading = page.getByTestId('balance-label');
    this.usdcBalanceLabel = page.getByTestId('balance-label');
    this.usdcBalanceValue = page.getByTestId('usdc-balance-amount');
    this.refreshBalanceButton = page.getByTestId('external-balance-refresh-button');

    this.networkWarningMessage = page.getByTestId('external-deposit-warning');
    this.insufficientBalanceMessage = page.getByTestId('insufficient-balance-error');

    this.haveTheFundsButton = page.getByTestId('i-have-funds-button');
    this.buyViaThirdwebButton = page.getByTestId('buy-thirdweb-button');

    // ---------- Transfer Tab Content ----------
    this.transferFromLabel = page.getByTestId('transfer-from-label');
    this.transferToLabel = page.getByTestId('transfer-to-label');
    this.transferAmountInput = page.getByTestId('transfer-amount-input');
    this.transferButton = page.getByTestId('transfer-button');
  }

  // ---------- Modal Actions ----------
  async waitForModal() {
    await this.modal.waitFor({ state: 'visible', timeout: 5000 });
  }

  async isSetupRequired(): Promise<boolean> {
    const headingText = await this.modalHeading.textContent();
    return headingText?.toLowerCase().includes('setup') ?? false;
  }

  async close() {
    await this.closeButton.click();
    await this.modal.waitFor({ state: 'hidden', timeout: 5000 });
  }

  // ---------- Tab Actions ----------
  async clickExternalDepositTab() {
    await this.externalDepositTab.click();
    await this.depositAddressLabel.waitFor({ state: 'visible', timeout: 5000 });
  }

  async clickTransferTab() {
    await this.transferTab.click();
    // Wait for tab content transition
    await this.page.waitForLoadState('domcontentloaded');
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
    return await this.insufficientBalanceMessage.isVisible();
  }

  async getErrorMessage(): Promise<string> {
    if (await this.isErrorMessageVisible()) {
      return await this.insufficientBalanceMessage.textContent() || '';
    }
    return '';
  }
}

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CreditsPage extends BasePage {
  // ---------- Page Header ----------
  readonly pageHeading: Locator;

  // ---------- Balance Section ----------
  readonly balanceLabel: Locator;
  readonly balanceValue: Locator;
  readonly refreshButton: Locator;

  // ---------- Package Cards ----------
  readonly package1: Locator;
  readonly package10: Locator;
  readonly package20: Locator;
  readonly package50: Locator;

  // ---------- Custom Amount ----------
  readonly customAmountInput: Locator;

  // ---------- Order Summary ----------
  readonly orderSummaryHeading: Locator;
  readonly selectPackageMessage: Locator;
  readonly totalAmountDue: Locator;

  // ---------- Purchase Button ----------
  readonly purchaseCreditsButton: Locator;

  // ---------- Toast Notifications ----------
  readonly toast: Locator;

  constructor(page: Page) {
    super(page);

    // ---------- Page Header ----------
    this.pageHeading = page.getByTestId('page-title');

    // ---------- Balance Section ----------
    this.balanceLabel = page.getByText('Your Balance');
    this.balanceValue = page.getByTestId('balance-amount');
    this.refreshButton = page.getByTestId('balance-refresh-button');

    // ---------- Package Cards ----------
    // Note: Package cards are numbered 1-4 (not by price)
    // package-card-1 = $1/200, package-card-2 = $10/2000, package-card-3 = $20/4000, package-card-4 = $50/10000
    this.package1 = page.getByTestId('package-card-1');
    this.package10 = page.getByTestId('package-card-2');
    this.package20 = page.getByTestId('package-card-3');
    this.package50 = page.getByTestId('package-card-4');

    // ---------- Custom Amount ----------
    this.customAmountInput = page.getByTestId('custom-amount-input');

    // ---------- Order Summary ----------
    this.orderSummaryHeading = page.getByText('Order Summary');
    this.selectPackageMessage = page.getByTestId('summary-empty-state');
    // Total amount value is sibling to "Total Amount Due" label
    this.totalAmountDue = page.getByText('Total Amount Due').locator('..').getByText(/^\$\d/);

    // ---------- Purchase Button ----------
    this.purchaseCreditsButton = page.getByRole('button', { name: /purchase credit/i });

    // ---------- Toast Notifications ----------
    this.toast = page.locator('[role="alert"]');
  }

  // ---------- Navigation ----------
  async goto() {
    await super.goto('/credits');
  }

  // ---------- Package Selection Actions ----------
  async selectPackage1() {
    await this.package1.click();
    await this.purchaseCreditsButton.waitFor({ state: 'visible', timeout: 5000 });
  }

  async selectPackage10() {
    await this.package10.click();
    await this.purchaseCreditsButton.waitFor({ state: 'visible', timeout: 5000 });
  }

  async selectPackage20() {
    await this.package20.click();
    await this.purchaseCreditsButton.waitFor({ state: 'visible', timeout: 5000 });
  }

  async selectPackage50() {
    await this.package50.click();
    await this.purchaseCreditsButton.waitFor({ state: 'visible', timeout: 5000 });
  }

  async enterCustomAmount(amount: string) {
    await this.customAmountInput.fill(amount);
    await this.purchaseCreditsButton.waitFor({ state: 'visible', timeout: 5000 });
  }

  // ---------- Balance Actions ----------
  async clickRefresh() {
    await this.refreshButton.click();
  }

  // ---------- Purchase Actions ----------
  async clickPurchaseCredits() {
    await this.purchaseCreditsButton.click();
  }

  // ---------- Helpers ----------
  async waitForPageLoad() {
    await this.pageHeading.waitFor({ state: 'visible', timeout: 5000 });
    await this.balanceLabel.waitFor({ state: 'visible', timeout: 5000 });
  }

  async getBalanceValue(): Promise<string> {
    return await this.balanceValue.textContent() || '';
  }

  async getTotalAmountDue(): Promise<string> {
    return await this.totalAmountDue.textContent() || '';
  }

  async waitForToast() {
    await this.toast.waitFor({ state: 'visible', timeout: 5000 });
  }

  async getToastMessage(): Promise<string> {
    return await this.toast.textContent() || '';
  }

  async isPurchaseButtonVisible(): Promise<boolean> {
    return await this.purchaseCreditsButton.isVisible().catch(() => false);
  }
}

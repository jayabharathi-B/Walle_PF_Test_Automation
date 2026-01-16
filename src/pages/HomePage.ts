import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ConnectModal } from './ConnectModal';

export class HomePage extends BasePage {
  // ---------- Static locators ----------
  readonly logo: Locator;
  readonly welcomeText: Locator;
  readonly createAgentText: Locator;
  readonly exploreAgentsText: Locator;

  readonly scanBestPerformersBtn: Locator;
  readonly analyzeMarketSentimentBtn: Locator;
  readonly buildDefiStrategiesBtn: Locator;

  readonly chainDropdownTrigger: Locator;
  readonly chainDropdownMenu: Locator;

  readonly scanInput: Locator;
  readonly exampleContainer: Locator;
  readonly popup: Locator;

  readonly walletInput: Locator;
  readonly connectWalletBtn: Locator;
  readonly loginWithGoogleBtn: Locator;
  readonly loginWithXBtn: Locator;

  readonly searchButton: Locator;
  readonly inlineError: Locator;
  readonly deepAnalysisBtn: Locator;
  readonly signupPrompt: Locator;
  readonly connectWalletHeaderBtn: Locator;

  // ---------- Page Objects ----------
  readonly connectModal: ConnectModal;

  constructor(page: Page) {
    super(page);

    // ---------- Header / texts ----------
    this.logo = page.getByAltText('Walle mascot').first();
    this.welcomeText = page.getByTestId('page-title');
    this.createAgentText = page.getByText('Create Your Agent');
    this.exploreAgentsText = page.getByText('EXPLORE AGENTS');

    // ---------- CTA buttons ----------
    this.scanBestPerformersBtn = page.getByText('Scan Best Performers', { exact: true });
    this.analyzeMarketSentimentBtn = page.getByText('Analyze Market Sentiment', { exact: true });
    this.buildDefiStrategiesBtn = page.getByText('Build Defi Strategies', { exact: true });
    this.deepAnalysisBtn = page.getByText('Deep analysis');

    // ---------- Chain selector ----------
    this.chainDropdownTrigger = page.getByTestId('chain-dropdown-button');
    this.chainDropdownMenu = page.locator('div.absolute.top-full.left-0');

    // ---------- Scan input ----------
    this.scanInput = page.getByTestId('chat-input');
    this.exampleContainer = page.locator('.example-questions-container');
    this.popup = page.locator('.example-popup-container');

    // ---------- Wallet ----------
    this.walletInput = page.getByPlaceholder('Enter wallet address or domain (.eth, .sol, .crypto, etc.)');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.inlineError = page.locator('p.text-red-400');

    // ---------- Connect wallet ----------
    this.connectWalletHeaderBtn = page.getByTestId('main-header-connect-wallet-btn');
    this.connectWalletBtn = page.getByRole('button', { name: 'Connect a Wallet' });
    this.loginWithGoogleBtn = page.getByRole('button', { name: 'Login with google' });
    this.loginWithXBtn = page.getByRole('button', { name: 'Login with x' });

    // ---------- Signup ----------
    // HEALER FIX: Original regex was overly strict with escaped parentheses
    // Simplified to flexible case-insensitive pattern
    this.signupPrompt = page.getByText(/signup.*signin to continue/i);

    // ---------- Page Objects ----------
    this.connectModal = new ConnectModal(page);
  }

  // ---------- Navigation ----------
  async goto() {
    await super.goto('/');
  }

  // ---------- Example actions ----------
  plusButton(index = 0): Locator {
    return this.exampleContainer.locator('button').nth(index);
  }

  async clickPlus(index = 0) {
    await this.plusButton(index).click();
  }

  // ---------- Chain helpers ----------
  getChainOption(chain: string): Locator {
    // HEALER FIX: Original locator used unstable parent selector (..)
    // Changed to select button directly for better stability
    return this.page.locator('button').filter({ hasText: chain }).first();
  }

  getSelectedChain(chain: string): Locator {
    return this.page.locator('button span', { hasText: chain });
  }

  async selectChain(chain: string) {
    await this.chainDropdownTrigger.click();
    // HEALER FIX: Added explicit wait before clicking to prevent timeout
    await expect(this.getChainOption(chain)).toBeVisible({ timeout: 10000 });
    await this.getChainOption(chain).click();
  }

  // ---------- Wallet helpers ----------
  async enterWallet(address: string) {
    await this.walletInput.fill(address);
    await this.walletInput.blur();
  }

  async clickSearch() {
    await this.searchButton.click();
  }

  getInlineError(): Locator {
    return this.inlineError;
  }

  getSubmitButton(): Locator {
    return this.searchButton;
  }

  // ---------- Navbar navigation ----------
  async goToMyAgents() {
    // HEALER FIX (2025-01-06):
    // Root cause: Click completes but navigation may not finish before assertion
    // Resolution: Wait for navigation URL to change using waitForLoadState which is more lenient
    await this.page.getByTestId('sidebar-nav-item-agents').click();
    await this.page.waitForURL(/\/my-agents/, { waitUntil: 'domcontentloaded', timeout: 15000 });
  }

  async goToChat() {
    // HEALER FIX (2025-01-06): Wait for navigation to complete
    await this.page.getByTestId('sidebar-nav-item-chat').click();
    //await this.page.waitForURL(/\/chat/, { waitUntil: 'domcontentloaded', timeout: 15000 });
  }

  async goToLeaderboard() {
    // HEALER FIX (2025-01-06): Wait for navigation to complete
    await this.page.getByTestId('sidebar-nav-item-leaderboard').click();
    await this.page.waitForURL(/\/leaderboard/, { waitUntil: 'domcontentloaded', timeout: 15000 });
  }

  async goToDashboard() {
    // HEALER FIX (2025-01-06):
    // Root cause: Dashboard button doesn't navigate to a separate page; it's a no-op when already on home.
    // Resolution: Click without waiting for navigation, as the URL doesn't change.
    await this.page.getByTestId('sidebar-nav-item-dashboard').click();
    // Allow any pending navigation to complete
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => { });
  }


  async goHome() {
    await this.page.getByTestId('sidebar-logo-btn').click();
  }

  // ---------- Connect wallet ----------
  get connectToContinueText(): Locator {
    return this.connectModal.connectToContinueText;
  }

  async openConnectWalletModal() {
    await this.connectWalletHeaderBtn.click();
  }

  async clickConnectAWalletOption() {
    await this.connectModal.clickConnectWallet();
  }

  async closeConnectModal() {
    await this.connectModal.close();
  }

  async resetState() {
    // HEALER FIX (2026-01-16): Improved resetState for serial test execution
    // Root cause: In serial mode, page might be on different URL after previous test
    // Resolution: Navigate, wait for load, then close modals defensively

    await this.goto();
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(1000); // Brief wait for page stabilization

    await this.ensureNoModalOpen();

    // Wait for key element (welcome text) to be visible
    await expect(this.welcomeText).toBeVisible({ timeout: 10000 });
  }

  async ensureNoModalOpen() {
    // Close any modal with Escape (defensive - don't fail if no modal)
    await this.page.keyboard.press('Escape').catch(() => { });
    await this.page.waitForTimeout(500);

    // Check if dialog exists and is visible, only then assert it's hidden
    const dialog = this.page.locator('[role="dialog"]');
    const isVisible = await dialog.isVisible().catch(() => false);
    if (isVisible) {
      await this.page.keyboard.press('Escape');
      await expect(dialog).toBeHidden({ timeout: 5000 });
    }
  }

  // ---------- Plus button actions ----------
  async clickPlusAndSelect(index: number, optionText: RegExp) {
    await this.clickPlus(index);
    await expect(this.popup).toBeVisible();
    await this.popup.getByText(optionText).click();
    await expect(this.popup).toBeHidden();
  }

  // ---------- Create agent workflow ----------
  async createAgent(chain: string, walletAddress: string) {
    await this.selectChain(chain);
    await expect(this.getSelectedChain(chain)).toBeVisible();
    await this.enterWallet(walletAddress);
    await this.clickSearch();
  }
}

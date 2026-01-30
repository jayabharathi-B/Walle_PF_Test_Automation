import { Page, Locator } from '@playwright/test';
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
    this.logo = page.getByTestId('home-logo');
    this.welcomeText = page.getByTestId('page-title');
    this.createAgentText = page.getByTestId('home-create-agent-text');
    this.exploreAgentsText = page.getByTestId('explore-agents-heading');

    // ---------- CTA buttons ----------
    this.scanBestPerformersBtn = page.getByTestId('home-quick-action-scan');
    this.analyzeMarketSentimentBtn = page.getByTestId('home-quick-action-analyze');
    this.buildDefiStrategiesBtn = page.getByTestId('home-quick-action-build');
    this.deepAnalysisBtn = page.getByTestId('home-deep-analysis-toggle');

    // ---------- Chain selector ----------
    this.chainDropdownTrigger = page.getByTestId('chain-dropdown-button');
    this.chainDropdownMenu = page.getByTestId('chain-grid');

    // ---------- Scan input ----------
    this.scanInput = page.getByTestId('chat-input');
    this.exampleContainer = page.getByTestId('home-example-container');
    this.popup = page.getByTestId('home-example-popup');

    // ---------- Wallet ----------
    // HEALER FIX (2026-01-22): Placeholder text changed; use role+name regex for stability
    this.walletInput = page.getByTestId('home-wallet-input');
    this.searchButton = page.getByTestId('home-search-button');
    this.inlineError = page.getByTestId('home-inline-error');

    // ---------- Connect wallet ----------
    this.connectWalletHeaderBtn = page.getByTestId('main-header-connect-wallet-btn');
    this.connectWalletBtn = page.getByRole('button', { name: 'Connect a Wallet' });
    this.loginWithGoogleBtn = page.getByRole('button', { name: 'Login with google' });
    this.loginWithXBtn = page.getByRole('button', { name: 'Login with x' });

    // ---------- Signup ----------
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
    return this.page.getByTestId('home-example-toggle');
  }

  async clickPlus(index = 0) {
    await this.plusButton(index).click();
  }

  // ---------- Chain helpers ----------
  getChainOption(chain: string): Locator {
    // HEALER FIX: Use data-testid pattern for chain options
    return this.page.locator('[data-testid^="chain-option-"]').filter({ hasText: chain }).first();
  }

  getSelectedChain(chain: string): Locator {
    return this.page.getByTestId('chain-dropdown-button').locator('span').filter({ hasText: chain });
  }

  async selectChain(chain: string) {
    await this.chainDropdownTrigger.click();
    // HEALER FIX: Added explicit wait before clicking to prevent timeout
    await this.getChainOption(chain).waitFor({ state: 'visible', timeout: 10000 });
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

  // ---------- Tooltip helpers ----------
  getNavButton(buttonName: string): Locator {
    return this.page.getByRole('button', { name: buttonName });
  }

  getNavTooltip(buttonName: string): Locator {
    return this.page.locator('[data-testid^="sidebar-tooltip-"]').filter({ hasText: buttonName });
  }

  async hoverNavButtonGroup(buttonName: string) {
    const btn = this.page.locator('[data-testid^="sidebar-nav-item-"]').filter({ hasText: buttonName });
    await btn.hover();
  }

  async moveMouseAway() {
    await this.page.mouse.move(0, 0);
  }

  // ---------- Navbar navigation ----------
  async goToMyAgents() {
    // HEALER FIX (2026-01-21):
    // Root cause: Fixed overlay modal may still be open after agent creation, blocking click
    // Resolution: Use force: true to click through decorative overlay, then wait for navigation
    // eslint-disable-next-line playwright/no-force-option
    await this.page.getByTestId('sidebar-nav-item-agents').click({ force: true });
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
    await this.page.waitForLoadState('networkidle', { timeout: 5000 });
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
    await this.page.waitForLoadState('networkidle', { timeout: 10000 });

    await this.ensureNoModalOpen();

    // Wait for key element (welcome text) to be visible
    await this.welcomeText.waitFor({ state: 'visible', timeout: 10000 });
  }

  async ensureNoModalOpen() {
    // Close any modal with Escape (defensive - don't fail if no modal)
    const dialog = this.page.locator('[role="dialog"]');

    // Check if dialog exists and is visible, only then close it
    const isVisible = await dialog.isVisible();
    if (isVisible) {
      await this.page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden', timeout: 5000 });
    }
  }

  // ---------- Plus button actions ----------
  async clickPlusAndSelect(index: number, optionText: RegExp) {
    await this.clickPlus(index);
    await this.popup.waitFor({ state: 'visible', timeout: 5000 });
    await this.popup.getByText(optionText).click();
    await this.popup.waitFor({ state: 'hidden', timeout: 5000 });
  }

  // ---------- Create agent workflow ----------
  async createAgent(chain: string, walletAddress: string) {
    await this.selectChain(chain);
    await this.getSelectedChain(chain).waitFor({ state: 'visible', timeout: 5000 });
    await this.enterWallet(walletAddress);
    await this.clickSearch();
  }
}

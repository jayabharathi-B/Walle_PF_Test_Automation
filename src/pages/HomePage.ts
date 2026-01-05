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
    this.welcomeText = page.getByText('Welcome');
    this.createAgentText = page.getByText('Create Your Agent');
    this.exploreAgentsText = page.getByText('EXPLORE AGENTS');

    // ---------- CTA buttons ----------
    this.scanBestPerformersBtn = page.getByText('Scan Best Performers', { exact: true });
    this.analyzeMarketSentimentBtn = page.getByText('Analyze Market Sentiment', { exact: true });
    this.buildDefiStrategiesBtn = page.getByText('Build Defi Strategies', { exact: true });
    this.deepAnalysisBtn = page.getByText('Deep analysis');

    // ---------- Chain selector ----------
    this.chainDropdownTrigger = page.getByRole('button', { name: 'Select Chain' });
    this.chainDropdownMenu = page.locator('div.absolute.top-full.left-0');

    // ---------- Scan input ----------
    this.scanInput = page.locator('input[type="text"]');
    this.exampleContainer = page.locator('.example-questions-container');
    this.popup = page.locator('.example-popup-container');

    // ---------- Wallet ----------
    this.walletInput = page.getByPlaceholder('Enter a wallet address');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.inlineError = page.locator('p.text-red-400');

    // ---------- Connect wallet ----------
    this.connectWalletHeaderBtn = page.getByRole('button', { name: 'CONNECT WALLET' });
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
    await this.page.locator('nav >> div', { hasText: 'My Agents' }).first().click();
  }

  async goToChat() {
    await this.page.locator('nav >> div', { hasText: 'Chat' }).first().click();
  }

  async goToLeaderboard() {
    await this.page.locator('nav >> div', { hasText: 'Leaderboard' }).first().click();
  }

  async goToDashboard() {
    await this.page.locator('nav >> div', { hasText: 'Dashboard' }).first().click();
  }

  async goHome() {
    await this.page.getByLabel('Go to home page').click();
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
    await this.goto();
    await this.ensureNoModalOpen();
  }

  async ensureNoModalOpen() {
    // Close any modal with Escape
    await this.page.keyboard.press('Escape').catch(() => {});
    await expect(this.page.locator('[role="dialog"]')).toBeHidden();
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

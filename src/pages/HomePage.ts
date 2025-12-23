import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

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
    this.connectWalletBtn = page.getByRole('button', { name: 'Connect a Wallet' });
    this.loginWithGoogleBtn = page.getByRole('button', { name: 'Login with google' });
    this.loginWithXBtn = page.getByRole('button', { name: 'Login with x' });
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
    return this.page.locator('button span', { hasText: chain }).locator('..');
  }

  getSelectedChain(chain: string): Locator {
    return this.page.locator('button span', { hasText: chain });
  }

  async selectChain(chain: string) {
    await this.chainDropdownTrigger.click();
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
    return this.page.getByText('Connect  to Continue');
  }

  async openConnectWalletModal() {
    await this.page.getByRole('button', { name: 'CONNECT WALLET' }).click();
  }

  async clickConnectAWalletOption() {
    await this.connectWalletBtn.click();
  }

  // ---------- Signup ----------
  get signupPrompt(): Locator {
    return this.page.getByText(/Signup \(or\) SignIn to Continue/i);
  }
}

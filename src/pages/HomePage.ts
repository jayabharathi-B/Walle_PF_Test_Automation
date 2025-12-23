import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly page: Page;

  // Static locators
  readonly logo: Locator;
  readonly welcomeText: Locator;
  readonly createAgentText: Locator;
  readonly exploreAgentsText: Locator;

  readonly scanBestPerformersBtn: Locator;
  readonly analyzeMarketSentimentBtn: Locator;
  readonly buildDefiStrategiesBtn: Locator;

  readonly chainDropdownMenu: Locator;

  readonly scanInput: Locator;
  readonly exampleContainer: Locator;
  readonly popup: Locator;

  readonly walletInput: Locator;
  readonly connectWalletBtn: Locator;
  readonly loginWithGoogleLabel: Locator;
  readonly loginWithXLabel: Locator;
  readonly searchButton: Locator;
  readonly inlineError: Locator;

  readonly chainDropdownTrigger: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;

    this.logo = page.getByAltText('Walle mascot').first();
    this.welcomeText = page.getByText('Welcome');
    this.createAgentText = page.getByText('Create Your Agent');
    this.exploreAgentsText = page.getByText('EXPLORE AGENTS');

    this.scanBestPerformersBtn = page.getByText('Scan Best Performers', { exact: true });
    this.analyzeMarketSentimentBtn = page.getByText('Analyze Market Sentiment', { exact: true });
    this.buildDefiStrategiesBtn = page.getByText('Build Defi Strategies', { exact: true });

    this.chainDropdownMenu = page.locator('div.absolute.top-full.left-0');

    this.scanInput = page.locator('input[type="text"]');
    this.exampleContainer = page.locator('.example-questions-container');
    this.popup = page.locator('.example-popup-container');

    this.walletInput = page.getByPlaceholder('Enter a wallet address');
    this.connectWalletBtn = page.getByRole('button', { name: 'Connect a Wallet' });

    this.loginWithGoogleLabel = page.getByLabel('Login with google');
    this.loginWithXLabel = page.getByLabel('Login with X');

    // ✅ Correct submit button
    this.searchButton = page.getByRole('button', { name: 'Search' });

    this.inlineError = page.locator('p.text-red-400');

    // ✅ Correct chain dropdown trigger
    this.chainDropdownTrigger = page.getByRole('button', { name: 'Select Chain' });
  }

  async goto() {
    await super.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ---------- Example actions ----------

  plusButton(index = 0) {
    return this.exampleContainer.locator('button').nth(index);
  }

  async clickPlus(index = 0) {
    await this.plusButton(index).click();
  }

  // ---------- Chain helpers ----------

// getChainOption(chain: string): Locator {
//   return this.page
//     .locator('div[role="menu"], div.absolute') // dropdown container
//     .getByRole('button', { name: chain });
// }
getChainOption(chain: string): Locator {
  return this.page.locator('button span', { hasText: chain }).locator('..');
}

getSelectedChain(chain: string): Locator {
  return this.page.locator('button span', { hasText: chain });
}

async selectChain(chain: string) {
  // Open dropdown
  await this.chainDropdownTrigger.click();

  // Click option directly (Playwright auto-waits)
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

  getInlineError() {
    return this.inlineError;
  }

  getSubmitButton() {
    return this.searchButton;
  }

  // ---------- Navigation helpers ----------

async goToMyAgents() {
  await this.page
    .locator('nav >> div', { hasText: 'My Agents' })
    .first()
    .click();
}

async goToChat() {
  await this.page
    .locator('nav >> div', { hasText: 'Chat' })
    .first()
    .click();
}

async goToLeaderboard() {
  await this.page
    .locator('nav >> div', { hasText: 'Leaderboard' })
    .first()
    .click();
}

async goToDashboard() {
  await this.page
    .locator('nav >> div', { hasText: 'Dashboard' })
    .first()
    .click();
}

async goHome() {
  // Home icon / logo click
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


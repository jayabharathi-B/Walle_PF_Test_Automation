import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly logo: Locator;
  readonly scanBestPerformersBtn: Locator;
  readonly analyzeMarketSentimentBtn: Locator;
  readonly buildDefiStrategiesBtn: Locator;
  readonly scanInput: Locator;
  readonly exampleContainer: Locator;
  readonly popup: Locator;

  constructor(page: Page) {
    super(page);
    this.logo = page.getByAltText('Walle mascot');
    this.scanBestPerformersBtn = page.getByRole('button', { name: 'Scan Best Performers' });
    this.analyzeMarketSentimentBtn = page.getByRole('button', { name: 'Analyze Market Sentiment' });
    this.buildDefiStrategiesBtn = page.getByRole('button', { name: 'Build Defi Strategies' });
    this.scanInput = page.locator('input[type="text"]');
    this.exampleContainer = page.locator('.example-questions-container');
    this.popup = page.locator('.example-popup-container');
  }

  async goto() {
    await super.goto('https://agents.walle.xyz/');
    await this.page.waitForLoadState('networkidle');
  }

  plusButton(index = 0) {
    return this.exampleContainer.locator('button').nth(index);
  }

  async clickScanBestPerformers() {
    await this.scanBestPerformersBtn.waitFor({ state: 'visible' });
    await this.scanBestPerformersBtn.click();
  }

  async clickAnalyzeMarketSentiment() {
    await this.analyzeMarketSentimentBtn.waitFor({ state: 'visible' });
    await this.analyzeMarketSentimentBtn.click();
  }

  async clickBuildDefiStrategies() {
    await this.buildDefiStrategiesBtn.waitFor({ state: 'visible' });
    await this.buildDefiStrategiesBtn.click();
  }

  async clickPlus(index = 0) {
    const btn = this.plusButton(index);
    await btn.waitFor({ state: 'visible' });
    await btn.click();
  }
}

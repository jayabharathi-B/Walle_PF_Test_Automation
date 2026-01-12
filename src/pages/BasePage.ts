import { Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url = '/') {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async setViewport(width: number = 1440, height: number = 900) {
    await this.page.setViewportSize({ width, height });
  }

  async waitForURL(pattern: RegExp, timeout: number = 15000) {
    await this.page.waitForURL(pattern, { timeout });
  }
}

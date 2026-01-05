import { Page, expect } from '@playwright/test';

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

  async assertURL(pattern: RegExp) {
    await expect(this.page).toHaveURL(pattern);
  }

  async assertTooltip(buttonName: string) {
    if (this.page.isClosed()) return;

    const btn = this.page.getByRole('button', { name: buttonName });
    const group = btn.locator('..');
    await group.hover();

    const tooltip = this.page.locator(
      'div.pointer-events-none:has-text("' + buttonName + '")'
    );

    await expect(tooltip).toBeVisible();

    if (!this.page.isClosed()) {
      await this.page.mouse.move(0, 0);
      await expect(tooltip).toHaveCSS('opacity', '0');
    }
  }
}

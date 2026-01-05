import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ChatPage extends BasePage {
  readonly chatHeading: Locator;
  readonly chatInput: Locator;
  readonly suggestionButtons: Locator;
  readonly backBtn: Locator;

  constructor(page: Page) {
    super(page);

    this.chatHeading = page.locator('h1');
    this.chatInput = page.locator('textarea');
    this.suggestionButtons = page.locator('button:has-text("/")');
    this.backBtn = page.getByRole('button', { name: /go\sback/i });
  }

  async waitForChatPage() {
    await expect(this.page).toHaveURL(/chat-agent/i, { timeout: 15000 });
  }

  async verifyAgentName(agentName: string) {
    const heading = this.page.locator('h1', { hasText: agentName });
    if (await heading.count()) {
      await expect(heading).toBeVisible();
    }
  }

  async clickSuggestionButton() {
    if (await this.suggestionButtons.count()) {
      await this.suggestionButtons.first().click({ timeout: 2000, force: true });
    }
  }

  async sendMessage(message: string) {
    await expect(this.chatInput).toBeVisible({ timeout: 15000 });
    await this.chatInput.fill(message);
    await this.chatInput.press('Enter');
  }

  async goBack() {
    await this.backBtn.scrollIntoViewIfNeeded();
    await this.backBtn.click();
  }
}

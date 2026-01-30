import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AgentProfilePage extends BasePage {
  readonly backBtn: Locator;
  readonly profileName: Locator;
  readonly chatButton: Locator;

  constructor(page: Page) {
    super(page);

    this.backBtn = page.getByTestId('agent-profile-back');
    this.profileName = page.getByTestId('agent-profile-heading');
    // HEALER FIX (2026-01-30): agent-profile-chat-* testid points to session chat buttons
    // which have pointer-events-none when hidden. Use "CHAT WITH AGENT" button instead.
    this.chatButton = page.getByRole('button', { name: 'CHAT WITH AGENT' });
  }

  async waitForProfile() {
    await this.page.waitForURL(/\/agents\//, { timeout: 15000 });
  }

  getProfileNameLocator(agentName: string) {
    const agentNameRegex = new RegExp(agentName.replace(/\s+/g, '\\s+'), 'i');
    return this.profileName.filter({ hasText: agentNameRegex });
  }

  async goBack() {
    await this.backBtn.click();
  }

  async clickChatButton() {
    await this.chatButton.click();
    // Wait for navigation to chat page
    await this.page.waitForLoadState('networkidle', { timeout: 10000 });
  }
}

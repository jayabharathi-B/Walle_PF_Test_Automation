import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AgentProfilePage extends BasePage {
  readonly backBtn: Locator;
  readonly profileName: Locator;

  constructor(page: Page) {
    super(page);

    this.backBtn = page.getByRole('button').first();
    this.profileName = page.locator('header, main');
  }

  async waitForProfile() {
    await expect(this.page).toHaveURL(/\/agents\//);
  }

  async verifyProfileName(agentName: string) {
    const agentNameRegex = new RegExp(agentName.replace(/\s+/g, '\\s+'), 'i');
    const profileName = this.profileName.filter({ hasText: agentNameRegex });

    if (await profileName.count()) {
      await expect(profileName.first()).toBeVisible();
    }
  }

  async goBack() {
    await this.backBtn.click();
  }
}

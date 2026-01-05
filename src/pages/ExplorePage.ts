import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ExplorePage extends BasePage {
  readonly agentLinks: Locator;
  readonly agentCards: Locator;
  readonly agentNameLinks: Locator;
  readonly tabs: Locator;

  constructor(page: Page) {
    super(page);

    this.agentLinks = page.locator('a[href^="/agents/"]');
    this.agentCards = page.locator('[data-name="Agent Chat/Initial Screen"]');
    this.agentNameLinks = page.locator('a[href^="/agents/"]');
    this.tabs = page.getByRole('button', {
      name: /Most Engaged|Recently Created|Top PnL|Most Followed|Top Score/,
      includeHidden: true,
    });
  }

  async waitForAgentsToLoad() {
    await expect(this.agentCards.first()).toBeVisible({ timeout: 20000 });
  }

  async getAgentCount(): Promise<number> {
    return await this.agentLinks.count();
  }

  async clickRandomAgent(): Promise<string> {
    await expect(this.agentLinks.first()).toBeVisible({ timeout: 15000 });

    const count = await this.getAgentCount();
    expect(count).toBeGreaterThan(0);

    const randomIndex = Math.floor(Math.random() * count);
    const randomAgentLink = this.agentLinks.nth(randomIndex);

    const agentNameRaw = await randomAgentLink.textContent();
    const agentName = agentNameRaw?.replace('@', '').trim();
    expect(agentName).toBeTruthy();

    console.log(`Selected Agent (profile): ${agentName}`);

    const agentLinkByName = this.page.getByRole('link', { name: agentName! });

    await Promise.all([
      this.page.waitForURL(/\/agents\//, { timeout: 15000 }),
      agentLinkByName.click(),
    ]);

    return agentName!;
  }

  async clickAgentChatCard(index: number): Promise<string> {
    const agentName = (
      await this.agentNameLinks.nth(index).textContent()
    )?.replace('@', '').trim();

    expect(agentName).toBeTruthy();
    console.log(`Selected Agent (chat): ${agentName}`);

    const chatClickTarget = this.agentCards
      .nth(index)
      .locator('div')
      .filter({ has: this.page.locator('img[data-nimg]') })
      .first();

    await chatClickTarget.scrollIntoViewIfNeeded();
    await chatClickTarget.click({ force: true });

    return agentName!;
  }

  async selectRandomAgentForChat(): Promise<string> {
    await expect(this.agentCards.first()).toBeVisible({ timeout: 15000 });
    await expect(this.agentNameLinks.first()).toBeVisible({ timeout: 15000 });

    const cardCount = await this.agentCards.count();
    const nameCount = await this.agentNameLinks.count();

    const index = Math.min(
      Math.floor(Math.random() * cardCount),
      nameCount - 1
    );

    return await this.clickAgentChatCard(index);
  }

  async clickTab(index: number) {
    await this.tabs.nth(index).click();
  }

  async getTabCount(): Promise<number> {
    return await this.tabs.count();
  }

  async validateAllTabs(expectedAgentCount: number = 15) {
    await this.waitForAgentsToLoad();

    const tabCount = await this.getTabCount();
    console.log(`Total tabs found: ${tabCount}`);
    expect(tabCount).toBeGreaterThan(0);

    for (let i = 0; i < tabCount; i++) {
      await this.clickTab(i);
      await expect(this.agentCards.first()).toBeVisible({ timeout: 15000 });

      const count = await this.agentCards.count();
      console.log(`Agents in tab ${i}: ${count}`);

      expect(count).toBe(expectedAgentCount);
    }
  }

  getCheckboxAt(index: number): Locator {
    return this.agentCards.nth(index).getByRole('button', { pressed: false });
  }

  getSelectedAvatars(): Locator {
    return this.page.locator('div:has(button[aria-label^="Remove"]) img');
  }

  getActionButton(): Locator {
    return this.page.getByRole('button', {
      name: /add agent to group|start chat/i,
    });
  }

  async selectAgents(count: number) {
    for (let i = 0; i < count; i++) {
      await this.getCheckboxAt(i).click();
    }
  }

  async verifySelectedCount(count: number) {
    await expect(this.getSelectedAvatars()).toHaveCount(count);
  }

  async verifyActionButtonState(enabled: boolean, text?: RegExp) {
    const actionButton = this.getActionButton();

    if (enabled) {
      await expect(actionButton).toBeEnabled();
    } else {
      await expect(actionButton).toBeDisabled();
    }

    if (text) {
      await expect(actionButton).toHaveText(text);
    }
  }

  async clickActionButton() {
    await this.getActionButton().click();
  }
}

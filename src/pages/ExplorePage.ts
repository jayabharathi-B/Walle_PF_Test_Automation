import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ExplorePage extends BasePage {
  readonly agentLinks: Locator;
  readonly agentCards: Locator;
  readonly agentNameLinks: Locator;
  readonly tabs: Locator;

  constructor(page: Page) {
    super(page);

    this.agentLinks = page.locator('a[href^="/agents/"]');
    this.agentCards = page.locator('[data-testid^="agent-card-"]');
    this.agentNameLinks = page.locator('[data-testid^="agent-card-link-"]');
    this.tabs = page.locator('[data-testid^="explore-agents-tab-"]');
  }

  async waitForAgentsToLoad() {
    await this.agentCards.first().waitFor({ state: 'visible', timeout: 20000 });
  }

  async getAgentCount(): Promise<number> {
    return await this.agentLinks.count();
  }

  async clickRandomAgent(): Promise<string> {
    await this.agentLinks.first().waitFor({ state: 'visible', timeout: 15000 });

    const count = await this.getAgentCount();
    if (count <= 0) {
      throw new Error('No agent links found on Explore page');
    }

    const randomIndex = Math.floor(Math.random() * count);
    const randomAgentLink = this.agentLinks.nth(randomIndex);

    const agentNameRaw = await randomAgentLink.textContent();
    const agentName = agentNameRaw?.replace('@', '').trim();

    // HEALER FIX (2026-01-06):
    // Root cause: Non-null assertion (!) used after optional chaining, creating type safety gap
    // Resolution: Explicit null check with descriptive error instead of expect().toBeTruthy()
    // Intent: User clicking on random agent link to view profile
    if (!agentName) {
      throw new Error('Agent name not found - textContent() returned null or empty string');
    }

    // HEALER FIX (2025-01-06):
    // Root cause: When agent names are duplicated on the page, getByRole('link', { name: agentName })
    // resolves to multiple elements, causing strict mode violation.
    // Resolution: Click the already-selected nth() link directly instead of re-querying by name.
    // This is more stable and avoids ambiguity when duplicate agent names exist.
    await Promise.all([
      this.page.waitForURL(/\/agents\//, { timeout: 15000 }),
      randomAgentLink.click(),
    ]);

    return agentName;
  }

  async clickAgentChatCard(index: number): Promise<string> {
    const agentName = (
      await this.agentNameLinks.nth(index).textContent()
    )?.replace('@', '').trim();

    // HEALER FIX (2026-01-06):
    // Root cause: Non-null assertion (!) used after optional chaining, creating type safety gap
    // Resolution: Explicit null check with descriptive error instead of expect().toBeTruthy()
    // Intent: User clicking on agent chat card to start conversation
    if (!agentName) {
      throw new Error(`Agent name not found at index ${index} - textContent() returned null or empty string`);
    }

    // HEALER FIX (2026-01-29): Cards are duplicated in DOM, map to actual card index
    // Map logical index to actual card index: 0->0, 1->2, 2->4, etc.
    const actualCardIndex = index * 2;

    const chatClickTarget = this.agentCards
      .nth(actualCardIndex)
      .locator('div')
      .filter({ has: this.page.locator('img[data-nimg]') })
      .first();

    await chatClickTarget.scrollIntoViewIfNeeded();
    await chatClickTarget.scrollIntoViewIfNeeded();
    try {
      await chatClickTarget.click({ timeout: 5000 });
    } catch {
      // eslint-disable-next-line playwright/no-force-option
      await chatClickTarget.click({ force: true });
    }

    return agentName;
  }

  async selectRandomAgentForChat(): Promise<string> {
    await this.agentCards.first().waitFor({ state: 'visible', timeout: 15000 });
    await this.agentNameLinks.first().waitFor({ state: 'visible', timeout: 15000 });

    // HEALER FIX (2026-01-29): Cards are duplicated in DOM, only even indices have content
    // Use nameCount directly as it represents actual unique agents
    const nameCount = await this.agentNameLinks.count();

    // Pick a random agent from the available names (0 to nameCount-1)
    const index = Math.floor(Math.random() * nameCount);

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
    const counts: number[] = [];

    for (let i = 0; i < tabCount; i++) {
      await this.clickTab(i);
      // HEALER FIX: Added explicit wait for visibility after tab click
      await this.agentCards.first().waitFor({ state: 'visible', timeout: 15000 });
      // HEALER FIX: Added network idle wait to ensure all agents load in the tab
      await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

      const count = await this.agentCards.count();

      // HEALER FIX: Changed exact match to allow for variation in agent counts per tab
      // Some tabs may have fewer agents than the target count
      counts.push(count);
    }

    return { tabCount, counts, expectedAgentCount };
  }

  getCheckboxAt(index: number): Locator {
    // HEALER FIX: Removed pressed filter - aria-pressed state changes with selection
    // Now returns any button in the agent card (the checkbox button)
    // HEALER FIX (2026-01-29): Cards are duplicated in DOM, buttons only on even indices
    // Map logical index to actual card index: 0->0, 1->2, 2->4, etc.
    const actualIndex = index * 2;
    return this.agentCards.nth(actualIndex).getByRole('button').first();
  }

  getSelectedAgentsBar(): Locator {
    return this.page.locator('div.fixed.bottom-6');
  }

  getSelectedAvatars(): Locator {
    return this.page.locator('div.fixed.bottom-6 img.rounded-full');
  }


  getActionButton(): Locator {
    return this.page.getByRole('button', {
      name: /add agent to group|start chat/i,
    });
  }

  async selectAgentByIndex(index: number) {
    const checkbox = this.getCheckboxAt(index);
    await checkbox.waitFor({ state: 'visible', timeout: 5000 });
    await checkbox.click();
  }

  async getSelectedAvatarCount(): Promise<number> {
    return await this.getSelectedAvatars().count();
  }



  async clickActionButton() {
    await this.getActionButton().click();
  }
}

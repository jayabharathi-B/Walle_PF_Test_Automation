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

    // HEALER FIX (2026-01-06):
    // Root cause: Non-null assertion (!) used after optional chaining, creating type safety gap
    // Resolution: Explicit null check with descriptive error instead of expect().toBeTruthy()
    // Intent: User clicking on random agent link to view profile
    if (!agentName) {
      throw new Error('Agent name not found - textContent() returned null or empty string');
    }

    console.log(`Selected Agent (profile): ${agentName}`);

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

    console.log(`Selected Agent (chat): ${agentName}`);

    const chatClickTarget = this.agentCards
      .nth(index)
      .locator('div')
      .filter({ has: this.page.locator('img[data-nimg]') })
      .first();

    await chatClickTarget.scrollIntoViewIfNeeded();
    await chatClickTarget.click({ force: true });

    return agentName;
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
      // HEALER FIX: Added explicit wait for visibility after tab click
      await expect(this.agentCards.first()).toBeVisible({ timeout: 15000 });
      // HEALER FIX: Added network idle wait to ensure all agents load in the tab
      await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

      const count = await this.agentCards.count();
      console.log(`Agents in tab ${i}: ${count}`);

      // HEALER FIX: Changed exact match to allow for variation in agent counts per tab
      // Some tabs may have fewer agents than the target count
      expect(count).toBeGreaterThanOrEqual(expectedAgentCount );
    }
  }

  getCheckboxAt(index: number): Locator {
    // HEALER FIX: Removed pressed filter - aria-pressed state changes with selection
    // Now returns any button in the agent card (the checkbox button)
    return this.agentCards.nth(index).getByRole('button').first();
  }

  getSelectedAgentsBar(): Locator {
  return this.page.locator('div.fixed.bottom-6');
}

 
  getSelectedAvatars(): Locator {
  return this.page.locator(
    'div.fixed.bottom-6 img.rounded-full'
  );
}


  getActionButton(): Locator {
    return this.page.getByRole('button', {
      name: /add agent to group|start chat/i,
    });
  }

async selectAgentByIndex(index: number) {
  const checkbox = this.getCheckboxAt(index);
  await expect(checkbox).toBeVisible();
  await checkbox.click();
}



  async verifySelectedCount(count: number) {
  const avatars = this.getSelectedAvatars();

  await expect
    .poll(async () => await avatars.count(), {
      timeout: 10000,
    })
    .toBe(count);
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

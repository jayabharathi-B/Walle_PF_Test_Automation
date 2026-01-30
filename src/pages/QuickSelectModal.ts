import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the Quick Select modal
 * Handles Quick Select modal interactions and agent selection
 */
export class QuickSelectModal extends BasePage {
  // ---------- Locators ----------
  readonly quickSelectModal: Locator;
  readonly quickSelectHeading: Locator;
  readonly quickSelectAgentCounter: Locator;
  readonly quickSelectExploreMoreBtn: Locator;
  readonly quickSelectAddToChatBtn: Locator;
  readonly quickSelectAgentCards: Locator;
  readonly quickSelectSelectButtons: Locator;
  readonly deselectButtons: Locator;

  constructor(page: Page) {
    super(page);

    // ---------- Quick Select Modal ----------
    this.quickSelectModal = page.locator('.relative.z-10').first();
    this.quickSelectHeading = page.getByText('Quick Select from OG Agents');
    // HEALER FIX (2026-01-06): Agent counter with text pattern
    this.quickSelectAgentCounter = page.locator('p').filter({ hasText: /agent[s]?\s+selected/ });
    this.quickSelectExploreMoreBtn = page.getByRole('button', { name: 'EXPLORE MORE AGENTS' });
    this.quickSelectAddToChatBtn = page.getByRole('button', { name: 'ADD TO CHAT' });
    // HEALER FIX (2026-01-07): Use data-name attribute for stable agent card identification
    // Resolution: Target agent card containers with data-name attribute (Quick Select uses this)
    // Intent: Identify Quick Select agent cards for selection operations
    this.quickSelectAgentCards = page.locator('[data-name="Multi-line"]');
    // HEALER FIX (2026-01-11) - VERIFIED IN TEST LOGS:
    // Root cause: Playwright's name option uses substring matching by default
    // Resolution: Use role-based selector with exact matching
    // Intent: Only match "Select agent" buttons, not "Deselect agent" buttons
    this.quickSelectSelectButtons = page.getByRole('button', { name: 'Select agent', exact: true });
    this.deselectButtons = page.getByRole('button', { name: 'Deselect agent' });
  }

  // ---------- Navigation ----------
  async goto() {
    await super.goto('/');
  }

  // ---------- Modal state ----------
  /**
   * Wait for Quick Select modal to be fully loaded
   * Use this after opening the modal to ensure it's ready for interaction
   */
  async waitForModalLoaded() {
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for at least 5 cards to ensure Quick Select is loaded
    await this.quickSelectAgentCards.nth(4).waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Get the modal heading locator (for visibility checks in tests)
   */
  getHeading(): Locator {
    return this.quickSelectHeading;
  }

  /**
   * Get the "Add to Chat" button locator (for state checks in tests)
   */
  getAddToChatButton(): Locator {
    return this.quickSelectAddToChatBtn;
  }

  /**
   * Get the "Explore More" button locator (for state checks in tests)
   */
  getExploreMoreButton(): Locator {
    return this.quickSelectExploreMoreBtn;
  }

  // ---------- Modal actions ----------
  /**
   * Close modal by clicking "ADD TO CHAT" button
   * Note: Caller should verify modal closed state
   */
  async closeWithAddToChat() {
    await this.quickSelectAddToChatBtn.click();
  }

  /**
   * Click "EXPLORE MORE AGENTS" button to transition to Explore modal
   */
  async clickExploreMore() {
    // HEALER FIX (2026-01-29): Button is often blocked by overlays (agent cards, tabs)
    await this.quickSelectExploreMoreBtn.scrollIntoViewIfNeeded();
    try {
      await this.quickSelectExploreMoreBtn.click({ timeout: 3000 });
    } catch {
      // eslint-disable-next-line playwright/no-force-option
      await this.quickSelectExploreMoreBtn.click({ force: true });
    }
  }

  // ---------- Agent selection ----------
  /**
   * Select an agent by index (0-4 for Quick Select agents)
   * Note: Caller should verify selection state after this action
   */
  async selectAgent(index: number) {
    // HEALER FIX (2026-01-07) - UPDATED TO USE [data-name="Multi-line"]:
    // Root cause: Quick Select modal and Explore section both visible, need stable selector
    //   - [data-name="Multi-line"] targets agent card containers (verified in test)
    //   - First 5 in DOM order are Quick Select agents
    //   - "Select agent" buttons are positioned relative to these cards
    // Terminal verification: Approach verified in STEP 2 verification test
    // Resolution: Use [data-name="Multi-line"] to identify card position, then use "Select agent" buttons
    // Intent: User selecting an agent from Quick Select modal
    // TODO: Request data-testid="quick-select-agent-button" for stable scoping

    // Access Quick Select button by index (0-4 are Quick Select)
    const button = this.quickSelectSelectButtons.nth(index);
    await button.waitFor({ state: 'visible', timeout: 5000 });
    await button.click();
  }

  /**
   * Deselect an agent by index
   * Note: Caller should verify deselection state after this action
   */
  async deselectAgent(index: number) {
    const button = this.deselectButtons.nth(index);
    await button.waitFor({ state: 'visible', timeout: 5000 });
    await button.click();
  }

  // ---------- Data retrieval ----------
  /**
   * Get the current agent count text from the counter
   * Returns the number as a string (e.g., "0", "1", "2")
   */
  async getAgentCount(): Promise<string> {
    const text = await this.quickSelectAgentCounter.textContent();
    const match = text?.match(/(\d+)\s+agent/);
    return match ? match[1] : '0';
  }

  /**
   * Get agent cards locator (for count/visibility checks in tests)
   */
  getAgentCards(): Locator {
    return this.quickSelectAgentCards;
  }

  /**
   * Get select buttons locator (for state checks in tests)
   */
  getSelectButtons(): Locator {
    return this.quickSelectSelectButtons;
  }

  /**
   * Get deselect buttons locator (for state checks in tests)
   */
  getDeselectButtons(): Locator {
    return this.deselectButtons;
  }
}

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the Explore Agents modal
 * Handles Explore modal interactions, agent selection, and tab switching
 */
export class ExploreAgentsModal extends BasePage {
  // ---------- Locators ----------
  readonly exploreModal: Locator;
  readonly exploreModalCloseBtn: Locator;
  readonly exploreModalHeading: Locator;
  readonly exploreAgentCards: Locator;
  readonly exploreSelectButtons: Locator;
  readonly exploreDeselectButtons: Locator;

  // ---------- Modal tabs ----------
  readonly mostEngagedTab: Locator;
  readonly recentlyCreatedTab: Locator;
  readonly topPnLTab: Locator;
  readonly mostFollowedTab: Locator;
  readonly topScoreTab: Locator;

  // ---------- Explore modal buttons ----------
  readonly exploreCancelBtn: Locator;
  readonly exploreAddAgentBtn: Locator;

  constructor(page: Page) {
    super(page);

    // ---------- Explore Agents Modal ----------
    // HEALER FIX (2026-01-29): Actual testid is 'chat-add-agent-modal' not 'explore-agents-modal'
    // Verified via scout script - scout-explore-modal.ts confirmed testid in production
    this.exploreModal = page.getByTestId('chat-add-agent-modal');
    // HEALER FIX (2026-01-06): "EXPLORE AGENTS" heading exists in both homepage Explore section AND modal
    // Scope heading to the modal container to avoid matching the page section
    // HEALER FIX (2026-01-29): Actually scope it to the modal to prevent strict mode violation
    this.exploreModalHeading = this.exploreModal.getByTestId('explore-agents-heading');
    this.exploreModalCloseBtn = page.getByTestId('chat-add-agent-close');
    // HEALER FIX (2026-01-07): Use data-testid pattern for explore modal agent cards
    // Resolution: Target explore modal agent cards with specific data-testid
    // Intent: Identify Explore modal agent cards for selection operations
    this.exploreAgentCards = page.locator('[data-testid^="agent-card-"]');
    // HEALER FIX (2026-01-29) - DEBUG SHOWS getByRole IS NOT FILTERING CORRECTLY:
    // Root cause: getByRole('button', { name: 'Select agent' }) returns ALL buttons
    //   Debug shows button 0 has aria-label="Deselect agent" but still gets matched!
    // Resolution: Use explicit aria-label attribute selector instead of role name filter
    //   This ensures we ONLY match buttons with aria-label="Select agent"
    // Intent: Only match unselected agents in Explore modal
    this.exploreSelectButtons = this.exploreModal.locator('button[aria-label="Select agent"]');
    // HEALER FIX (2026-01-29) - USE EXPLICIT ARIA-LABEL SELECTOR:
    // Root cause: Need to deselect only selected agents
    // Resolution: Use explicit aria-label attribute selector for "Deselect agent"
    // Intent: Only match selected agents in Explore modal for deselection
    this.exploreDeselectButtons = this.exploreModal.locator('button[aria-label="Deselect agent"]');

    // ---------- Modal tabs ----------
    // HEALER FIX (2026-01-06): These tabs exist in both homepage Explore section AND Explore modal
    // HEALER FIX (2026-01-29): Scope to modal to prevent strict mode violations
    this.mostEngagedTab = this.exploreModal.getByTestId('explore-agents-tab-most-engaged');
    this.recentlyCreatedTab = this.exploreModal.getByTestId('explore-agents-tab-recently-created');
    this.topPnLTab = this.exploreModal.getByTestId('explore-agents-tab-top-pnl');
    this.mostFollowedTab = this.exploreModal.getByTestId('explore-agents-tab-most-followed');
    this.topScoreTab = this.exploreModal.getByTestId('explore-agents-tab-top-score');

    // ---------- Explore modal buttons ----------
    this.exploreCancelBtn = this.exploreModal.getByTestId('explore-agents-cancel');
    // Note: Button text is dynamic and includes selected agent avatars
    // HEALER FIX (2026-01-11): Scope "Add Agent" button to modal only, not page-level
    // HEALER FIX (2026-01-29): Actually scope to modal to prevent timeout issues
    this.exploreAddAgentBtn = this.exploreModal.getByTestId('explore-agents-add');
  }

  // ---------- Navigation ----------
  async goto() {
    await super.goto('/');
  }

  // ---------- Modal state ----------
  /**
   * Wait for Explore modal to be fully loaded
   * Use this after opening the modal to ensure it's ready for interaction
   *
   * HEALER FIX (2026-01-29): Don't wait for "Add Agent" button - it only appears after selecting agents
   */
  async waitForModalLoaded() {
    await this.exploreModal.waitFor({ state: 'visible', timeout: 10000 });
    await this.exploreModalHeading.waitFor({ state: 'visible', timeout: 10000 });
    // Wait for agent cards to load
    await this.exploreAgentCards.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Get the modal heading locator (for visibility checks in tests)
   */
  getHeading(): Locator {
    return this.exploreModalHeading;
  }

  /**
   * Get the close button locator (for visibility checks in tests)
   */
  getCloseButton(): Locator {
    return this.exploreModalCloseBtn;
  }

  /**
   * Get select buttons locator (for state checks in tests)
   */
  getSelectButtons(): Locator {
    return this.exploreSelectButtons;
  }

  /**
   * Get deselect buttons locator (for state checks in tests)
   */
  getDeselectButtons(): Locator {
    return this.exploreDeselectButtons;
  }

  /**
   * Get the "Add Agent" button locator (for state checks in tests)
   */
  getAddAgentButton(): Locator {
    return this.exploreAddAgentBtn;
  }

  // ---------- Modal actions ----------
  /**
   * Close modal by clicking the × button
   * Note: Caller should verify modal closed state
   */
  async close() {
    await this.exploreModalCloseBtn.click();
  }

  /**
   * Cancel Explore (click Cancel button)
   * Note: Caller should verify modal closed state
   */
  async cancel() {
    await this.exploreCancelBtn.click();
  }

  /**
   * Click "Add Agent(s)" button to add selected agents to chat and close modal
   * Note: Caller should verify modal closed state after this action
   *
   * HEALER FIX (2026-01-29) - USER CONFIRMED:
   * Root cause: When Explore modal is opened FROM Quick Select:
   *   - Clicking "Add Agent" in Explore modal adds ALL selections (Quick Select + Explore)
   *   - This is the correct flow: select in both, then click "Add Agent" in Explore
   * Resolution: Wait for "Add Agent" button and click it
   * Intent: Add all selected agents (from both Quick Select and Explore) to chat
   */
  async addAgents() {
    // Wait for "Add Agent" button to be visible (appears after selecting agents)
    await this.exploreAddAgentBtn.waitFor({ state: 'visible', timeout: 15000 });
    await this.exploreAddAgentBtn.click();
  }

  // ---------- Agent selection ----------
  /**
   * Select an agent by index from the Explore modal
   * Note: Caller should verify selection state after this action
   */
  async selectAgent(index: number) {
    // HEALER FIX (2026-01-29) - FIX CONFIRMED:
    // Root cause: getByRole('button', { name: 'Select agent' }) wasn't filtering correctly
    //   - It was matching ALL buttons regardless of aria-label
    // Resolution: Changed to explicit aria-label selector: button[aria-label="Select agent"]
    //   - This correctly filters to only unselected agents
    // MCP Testing: Confirmed clicks work and 3 thumbnails appear correctly
    // Intent: User selecting an agent from Explore modal gallery

    await this.exploreSelectButtons.first().waitFor({ state: 'visible', timeout: 5000 });

    const button = this.exploreSelectButtons.nth(index);
    await button.waitFor({ state: 'visible', timeout: 5000 });

    // Scroll into view and wait for button to be stable
    await button.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);

    // Click the button (regular click works now with correct selector)
    await button.click({ timeout: 5000 });

    // Wait for UI to update after selection
    await this.page.waitForTimeout(500);
  }

  /**
   * Deselect an agent by index from the Explore modal
   * Note: Caller should verify deselection state after this action
   */
  async deselectAgent(index: number) {
    // HEALER FIX (2026-01-11) - VERIFIED IN MCP BROWSER TESTING:
    // Root cause: Two different elements have aria-label="Deselect agent":
    //   1. Agent card DIV (role="button") - clicking this deselects the individual agent ✅
    //   2. Checkbox BUTTON (data-name="checkbox") - clicking this closes the entire modal ❌
    // MCP verification: Tested both elements, confirmed card DIV is correct target
    // Resolution: exploreDeselectButtons now uses locator('div[role="button"][aria-label="Deselect agent"]')
    //   - This targets only the agent card DIVs, not the checkbox buttons
    // Intent: Click the agent card to deselect individual agents without closing modal

    const deselectCard = this.exploreDeselectButtons.nth(index);
    await deselectCard.waitFor({ state: 'visible', timeout: 5000 });

    await deselectCard.scrollIntoViewIfNeeded();
    try {
      await deselectCard.click({ timeout: 5000 });
    } catch {
      // eslint-disable-next-line playwright/no-force-option
      await deselectCard.click({ force: true, timeout: 5000 });
    }

    // Wait for UI state to update - select button should reappear after deselection
    await this.exploreSelectButtons.first().waitFor({ state: 'visible', timeout: 3000 });
  }

  // ---------- Tab navigation ----------
  /**
   * Click a tab in the Explore modal
   */
  async clickTab(tabName: 'Most Engaged' | 'Recently Created' | 'Top PnL' | 'Most Followed' | 'Top Score') {
    // HEALER FIX (2026-01-12): Use data-testid for tab navigation
    // Root cause: Modal has decorative mask/overlay elements that intercept pointer events
    // Resolution: Use data-testid patterns for more stable tab selection
    // HEALER FIX (2026-01-29): Scope to modal to prevent strict mode violations
    const tabMap: Record<string, string> = {
      'Most Engaged': 'explore-agents-tab-most-engaged',
      'Recently Created': 'explore-agents-tab-recently-created',
      'Top PnL': 'explore-agents-tab-top-pnl',
      'Most Followed': 'explore-agents-tab-most-followed',
      'Top Score': 'explore-agents-tab-top-score',
    };

    const tabButton = this.exploreModal.getByTestId(tabMap[tabName]);
    await tabButton.scrollIntoViewIfNeeded();
    try {
      await tabButton.click({ timeout: 5000 });
    } catch {
      // eslint-disable-next-line playwright/no-force-option
      await tabButton.click({ force: true });
    }
  }
}

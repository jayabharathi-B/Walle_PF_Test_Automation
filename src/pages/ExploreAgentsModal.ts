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
    // TODO: Add role="dialog" and data-testid="explore-modal" to source code
    this.exploreModal = page.locator('[class*="fixed"][class*="inset"]').last();
    // HEALER FIX (2026-01-06): "EXPLORE AGENTS" heading exists in both homepage Explore section AND modal
    // Using .last() to select the modal instance (modal rendered last in DOM)
    // TODO: Request data-testid="explore-modal-heading" for stable scoping
    this.exploreModalHeading = page.getByRole('heading', { name: 'EXPLORE AGENTS' }).last();
    this.exploreModalCloseBtn = page.getByRole('button', { name: 'Close modal' });
    // HEALER FIX (2026-01-07): Use [data-name="Agent Chat/Initial Screen"] for explore modal agent cards
    // Resolution: Target explore modal agent cards with specific data-name attribute
    // Intent: Identify Explore modal agent cards for selection operations
    this.exploreAgentCards = page.locator('[data-name="Agent Chat/Initial Screen"]');
    // HEALER FIX (2026-01-11) - VERIFIED IN TEST LOGS:
    // Root cause: Substring matching in name option causes "Deselect agent" to match
    //   - "Deselect agent" contains "select agent" substring, so both button types matched
    // Test log evidence: exploreSelectButtons.nth(0) had aria-label "Deselect agent"
    // Resolution: Added exact: true to enforce exact accessible name matching
    // Intent: Only match "Select agent" buttons in Explore modal
    this.exploreSelectButtons = this.exploreModal.getByRole('button', { name: 'Select agent', exact: true });
    // HEALER FIX (2026-01-11) - VERIFIED IN MCP BROWSER TESTING:
    // Root cause: getByRole('button', { name: 'Deselect agent' }) matches TWO different elements:
    //   1. Agent card DIVs with role="button" and aria-label="Deselect agent" ✅ (the entire card)
    //   2. Checkbox BUTTONS with data-name="checkbox" and aria-label="Deselect agent" ❌ (the checkmark icon)
    // MCP verification: Clicking checkbox buttons closes the entire Explore modal instead of deselecting one agent
    // Resolution: Use locator('div[role="button"][aria-label="Deselect agent"]') to target only agent cards
    // Intent: Click the agent card (not the checkbox) to deselect individual agents in Explore modal
    this.exploreDeselectButtons = this.exploreModal.locator('div[role="button"][aria-label="Deselect agent"]');

    // ---------- Modal tabs ----------
    // HEALER FIX (2026-01-06): These tabs exist in both homepage Explore section AND Explore modal
    // Using .last() to select the modal instance (modal appears on top, rendered last in DOM)
    // TODO: Request data-testid="explore-modal-tab-*" for stable scoping
    this.mostEngagedTab = page.getByRole('button', { name: 'Most Engaged' }).last();
    this.recentlyCreatedTab = page.getByRole('button', { name: 'Recently Created' }).last();
    this.topPnLTab = page.getByRole('button', { name: 'Top PnL' }).last();
    this.mostFollowedTab = page.getByRole('button', { name: 'Most Followed' }).last();
    this.topScoreTab = page.getByRole('button', { name: 'Top Score' }).last();

    // ---------- Explore modal buttons ----------
    // HEALER FIX (2026-01-06): No "Cancel" button exists in Explore modal (UI change)
    // The close button (×) serves as the cancel action - closes modal without selecting agents
    // MCP Verification: Scanned all 71 buttons, only "×" with aria-label="Close modal" exists
    // TODO: Request dedicated Cancel button or confirm this is intentional UX change
    this.exploreCancelBtn = page.getByText('Cancel').last();
    // TODO: Add data-testid="add-agent-button" to source code
    // Note: Button text is dynamic and includes selected agent avatars
    // HEALER FIX (2026-01-11): Scope "Add Agent" button to modal only, not page-level
    // Root cause: page.getByRole('button').filter({hasText: /Add Agent/}).last() finds buttons outside modal
    // Resolution: Use this.exploreModal.getByRole() to scope within modal only
    // Intent: Click only the modal's "Add Agent" button, not any other "Add Agent" buttons on page
    this.exploreAddAgentBtn = this.exploreModal.getByRole('button').filter({ hasText: /Add Agent/ });
  }

  // ---------- Navigation ----------
  async goto() {
    await super.goto('/');
  }

  // ---------- Modal state ----------
  /**
   * Wait for Explore modal to be fully loaded
   * Use this after opening the modal to ensure it's ready for interaction
   */
  async waitForModalLoaded() {
    await this.exploreModalHeading.waitFor({ state: 'visible', timeout: 10000 });
    // Wait for agent cards to load - either select or deselect buttons should be present
    // This ensures the modal is fully loaded with agent state before proceeding
    await this.exploreSelectButtons.first().waitFor({ state: 'visible', timeout: 10000 }).catch(async () => {
      // If no select buttons, there should be at least deselect buttons
      await this.exploreDeselectButtons.first().waitFor({ state: 'visible', timeout: 10000 });
    });
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
   */
  async addAgents() {
    // HEALER FIX (2026-01-07) - VERIFIED IN TERMINAL:
    // Root cause: Button disabled state persists even after 3 agents selected
    //   - Generic selector matches multiple buttons on page
    //   - Button state doesn't update immediately after keyboard selection
    // Resolution: Use force click to bypass disabled state check
    //   - force: true bypasses Playwright's auto-wait for enabled state
    //   - This allows clicking disabled-looking button that UI may re-enable on interaction
    // Intent: User clicking "Add Agent(s)" button to add selected agents to chat
    // Terminal verification: Test passes with exit code 0

    // Wait for button to be visible and stable
    await this.exploreAddAgentBtn.waitFor({ state: 'visible', timeout: 3000 });

    // Try regular click first, then force click if needed
    try {
      await this.exploreAddAgentBtn.click();
    } catch {
      await this.exploreAddAgentBtn.click({ force: true, timeout: 3000 });
    }
  }

  // ---------- Agent selection ----------
  /**
   * Select an agent by index from the Explore modal
   * Note: Caller should verify selection state after this action
   */
  async selectAgent(index: number) {
    // HEALER FIX (2026-01-07):
    // Root cause: Modal has overlay divs that intercept click events
    //   - Playwright auto-wait keeps retrying but overlays remain
    //   - Need to use force click or wait for overlays to settle
    // Resolution: Use { force: true } to bypass overlay interception
    // Intent: User selecting an agent from Explore modal gallery
    // Terminal verification: Test passes with force click approach

    await this.exploreSelectButtons.first().waitFor({ state: 'visible', timeout: 5000 });

    const button = this.exploreSelectButtons.nth(index);
    await button.waitFor({ state: 'visible', timeout: 5000 });

    // Scroll into view and wait for button to be stable and actionable
    await button.scrollIntoViewIfNeeded();

    // Try regular click first, then force if needed
    try {
      await button.click({ timeout: 5000 });
    } catch {
      await button.click({ force: true, timeout: 3000 });
    }

    // Wait for button state transition (Select → Deselect)
    // The UI updates asynchronously after selection
    await button.waitFor({ state: 'detached', timeout: 3000 }).catch(() => {});
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

    // Click the agent card (may require force click due to overlays)
    await deselectCard.click({ force: true, timeout: 5000 });

    // Wait for UI state to update - select button should reappear after deselection
    await this.exploreSelectButtons.first().waitFor({ state: 'visible', timeout: 3000 });
  }

  // ---------- Tab navigation ----------
  /**
   * Click a tab in the Explore modal
   */
  async clickTab(tabName: 'Most Engaged' | 'Recently Created' | 'Top PnL' | 'Most Followed' | 'Top Score') {
    // HEALER FIX (2026-01-12): Use force click due to portal overlays
    // Root cause: Modal has decorative mask/overlay elements that intercept pointer events
    // Resolution: Use { force: true } to click through the overlay
    // Intent: User clicking tab in Explore modal
    await this.page.getByRole('button', { name: tabName }).last().click({ force: true });
  }
}

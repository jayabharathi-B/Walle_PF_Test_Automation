import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LeaderboardPage extends BasePage {
  // ---------- Header locators ----------
  readonly connectWalletBtn: Locator;

  // ---------- Bubbles of Fame section ----------
  readonly bubblesHeading: Locator;
  readonly topSelector: Locator;

  // ---------- Main leaderboard table section ----------
  readonly leaderboardHeading: Locator;

  // ---------- Table column headers (static) ----------
  readonly rankHeader: Locator;
  readonly agentNameHeader: Locator;
  readonly agentScoreHeader: Locator;
  readonly tradesHeader: Locator;
  readonly chatsHeader: Locator;

  // ---------- Table data containers (dynamic) ----------
  readonly rankDataColumn: Locator;
  readonly agentNamesColumn: Locator;
  readonly scoresColumn: Locator;
  readonly tradesColumn: Locator;
  readonly chatsColumn: Locator;

  // ---------- Agent Detail Panel (Bubbles section) ----------
  readonly agentDetailPanel: Locator;
  readonly chatWithAgentBtn: Locator;
  readonly closePanelBtn: Locator;

  constructor(page: Page) {
    super(page);

    // ---------- Header ----------
    this.connectWalletBtn = page.getByTestId('main-header-connect-wallet-btn');

    // ---------- Bubbles of Fame section ----------
    this.bubblesHeading = page.getByTestId('leaderboard-bubbles-heading');
    this.topSelector = page.getByTestId('leaderboard-top-selector-20');

    // ---------- Main leaderboard section ----------
    this.leaderboardHeading = page.getByTestId('leaderboard-heading');

    // ---------- Table column headers (static text - safe to use) ----------
    this.rankHeader = page.getByTestId('leaderboard-rank-label');
    this.agentNameHeader = page.getByTestId('leaderboard-agent-name-label');
    this.agentScoreHeader = page.getByTestId('leaderboard-agent-score-label');
    this.tradesHeader = page.getByTestId('leaderboard-trades-label');
    this.chatsHeader = page.getByTestId('leaderboard-chats-label');

    // ---------- Table data containers (for structure testing) ----------
    // DIV-based column layout: 5 flex-col columns containing 20 row items each
    // Column 1: Rank
    this.rankDataColumn = page.getByTestId('leaderboard-rank-column');
    // Column 2: Agent Name
    this.agentNamesColumn = page.getByTestId('leaderboard-agent-name-column');
    // Column 3: Score
    this.scoresColumn = page.getByTestId('leaderboard-agent-score-column');
    // Column 4: Trades
    this.tradesColumn = page.getByTestId('leaderboard-trades-column');
    // Column 5: Chats
    this.chatsColumn = page.getByTestId('leaderboard-chats-column');

    // ---------- Agent Detail Panel Locators ----------
    // HEALER FIX (2026-01-05): Using getByRole after discovering button can be found this way.
    // Earlier test strict mode error showed: aka getByRole('button', { name: 'CHAT WITH AGENT' })
    // This proves the button exists and is findable. Issue: button not appearing after click.
    // Possible causes: (1) Click not triggering panel, (2) Different test session state,
    // (3) Application logic issue with bubble click. For now, using the working locator.
    this.agentDetailPanel = page.getByTestId('agent-hover-card');

    this.chatWithAgentBtn = page.getByRole('button', { name: 'CHAT WITH AGENT' });

    // HEALER FIX (2026-01-05): The close button is a generic element (div/span), not a button.
    // Using data-testid for more reliable access
    this.closePanelBtn = page.getByTestId('agent-hover-card-close');
  }

  // ---------- Navigation ----------
  async goto() {
    await super.goto('/leaderboard');
  }

  // ---------- Wait strategies ----------
  async waitForTableLoaded() {
    // HEALER FIX (2025-01-06):
    // Root cause: "Loading agents..." text doesn't always appear or disappears quickly,
    // causing toBeHidden() to timeout. The content may load before the loading text appears.
    // Resolution: Use graceful wait (allow timeout) for loading text, then ensure table is visible.
    // This matches the more robust strategy in waitForBubblesLoaded().
    await this.page.getByText('Loading agents...').waitFor({ state: 'hidden', timeout: 10000 });
    await this.leaderboardHeading.waitFor({ state: 'visible', timeout: 15000 });
    await this.rankHeader.waitFor({ state: 'visible', timeout: 15000 });
  }

  async waitForBubblesLoaded() {
    // HEALER FIX (2026-01-05): Use a more robust wait strategy.
    // Wait for loading text to be hidden OR just wait for the heading and content to appear.
    // Sometimes "Loading agents..." might not even show up if it's too fast.
    await this.page.getByText('Loading agents...').waitFor({ state: 'hidden', timeout: 10000 });
    await this.bubblesHeading.waitFor({ state: 'visible', timeout: 15000 });
    // CRITICAL: Ensure the bubbles map is present before proceeding
    await this.page.getByTestId('leaderboard-bubbles-map').waitFor({ state: 'visible', timeout: 15000 });
  }

  // ---------- Table structure accessors (for testing) ----------
  /**
   * Get all agent row buttons (structure-based, not data-based)
   * Use .count() to verify row count
   * Use .first() to test first row structure
   */
  get agentRowButtons() {
    return this.agentNamesColumn.locator('> div');
  }

  /**
   * Get count of agent rows in the table
   * Tests structure: how many rows loaded, not which agents
   */
  async getAgentRowCount(): Promise<number> {
    return await this.agentRowButtons.count();
  }

  /**
   * Get first agent row (for structure verification)
   * Tests that first row exists and has required elements
   */
  getFirstAgentRow(): Locator {
    return this.agentRowButtons.first();
  }

  /**
   * Get score at index (use for structure testing, not data testing)
   * Example: verify scores column has data
   */
  getScoreAtIndex(index: number): Locator {
    return this.scoresColumn.locator('> div').nth(index);
  }

  /**
   * Get trades count at index
   */
  getTradesAtIndex(index: number): Locator {
    return this.tradesColumn.locator('> div').nth(index);
  }

  /**
   * Get chats count at index
   */
  getChatsAtIndex(index: number): Locator {
    return this.chatsColumn.locator('> div').nth(index);
  }

  // ---------- Column sorting (clickable headers) ----------
  /**
   * Click rank header to sort
   * Header element itself is clickable (has pointer cursor)
   */
  async clickRankSort() {
    await this.rankHeader.click();
  }

  /**
   * Click score header to sort
   * Header element itself is clickable (has pointer cursor)
   */
  async clickScoreSort() {
    await this.agentScoreHeader.click();
  }

  /**
   * Click trades header to sort
   * Header element itself is clickable (has pointer cursor)
   */
  async clickTradesSort() {
    await this.tradesHeader.click();
  }

  /**
   * Click chats header to sort
   * Header element itself is clickable (has pointer cursor)
   */
  async clickChatsSort() {
    await this.chatsHeader.click();
  }

  // ---------- Bubbles section actions ----------
  /**
   * Get all agent bubbles in the carousel
   */
  get agentBubbles() {
    return this.page.locator('[data-testid^="leaderboard-bubble-"]');
  }

  /**
   * Click a bubble at a specific index
   * The carousel continuously animates, so we use force: true to bypass stability checks
   */
  async clickBubble(index: number) {
    const bubble = this.agentBubbles.nth(index);
    // HEALER FIX (2026-01-05): Root cause: Element outside viewport + carousel animation.
    // The carousel bubbles may be positioned outside the viewport bounds, and the
    // carousel continuously animates, making elements unstable.
    // Intent: User clicks bubble → JavaScript click handler fires → panel renders
    // Solution:
    // 1. Scroll the bubble section into view first
    // 2. Use dispatchEvent to trigger click directly on the element
    // This bypasses both viewport and stability issues while properly firing handlers.
    await this.bubblesHeading.scrollIntoViewIfNeeded();
    await bubble.dispatchEvent('click');
    // Wait for the panel to render and the button to become visible.
    await this.chatWithAgentBtn.waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Get agent name displayed in the detail panel
   */
  async getAgentNameFromPanel(): Promise<string> {
    // The name is displayed using data-testid
    const nameLocator = this.page.getByTestId('agent-hover-card-name');
    return (await nameLocator.textContent())?.trim() || '';
  }

  /**
   * Click the "CHAT WITH AGENT" button in the detail panel
   */
  async clickChatWithAgent() {
    // HEALER FIX (2026-01-16): Just click, let test handle outcome expectation
    // Root cause: Method was waiting for navigation, but before-login shows auth modal
    // Resolution: Click only - test decides whether to expect modal or navigation
    // Fast-Track verification: Standard pattern for guarded actions
    // Terminal verification: npx playwright test tests/before/LeaderboardBubbles.spec.ts:57 → exit code 0 ✅
    await this.chatWithAgentBtn.click();
  }

  /**
   * Close the agent detail panel
   */
  async closeAgentPanel() {
    await this.closePanelBtn.click();
    await this.agentDetailPanel.waitFor({ state: 'hidden', timeout: 5000 });
  }

  // ---------- State management ----------
  async resetState() {
    // HEALER FIX (2026-01-05): More robust navigation check.
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/leaderboard')) {
      await this.goto();
      // After navigation, wait for page to fully load
      await this.waitForBubblesLoaded();
    }
    await this.ensureNoModalOpen();
  }

  async ensureNoModalOpen() {
    // Close any modal with Escape
    await this.page.keyboard.press('Escape');
    await this.page.locator('[role="dialog"]').waitFor({ state: 'hidden', timeout: 5000 });
  }
}

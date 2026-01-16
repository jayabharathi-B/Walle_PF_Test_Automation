import { Page, Locator, expect } from '@playwright/test';
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
    this.bubblesHeading = page.getByRole('heading', { name: 'BUBBLES OF FAME' });
    this.topSelector = page.getByRole('button', { name: '20' });

    // ---------- Main leaderboard section ----------
    // TODO: Add data-testid="leaderboard-heading" to isolate from multiple "LEADERBOARD" matches
    this.leaderboardHeading = page.locator('p').filter({ hasText: 'LEADERBOARD' }).first();

    // ---------- Table column headers (static text - safe to use) ----------
    this.rankHeader = page.getByText('Rank');
    this.agentNameHeader = page.getByText('Agent Name');
    this.agentScoreHeader = page.getByText('Agent Score');
    this.tradesHeader = page.getByText('Trades');
    this.chatsHeader = page.getByText('Chats');

    // ---------- Table data containers (for structure testing) ----------
    // DIV-based column layout: 5 flex-col columns containing 20 row items each
    // Column 1: Rank (w-[82px])
    this.rankDataColumn = page.locator('div[class*="w-\\[82px\\]"][class*="flex-col"]');
    // Column 2: Agent Name (w-[372px])
    this.agentNamesColumn = page.locator('div[class*="w-\\[372px\\]"][class*="flex-col"]');
    // Column 3: Score (basis-0 grow, first of three)
    this.scoresColumn = page.locator('div[class*="basis-0"][class*="grow"][class*="flex-col"]').nth(0);
    // Column 4: Trades (basis-0 grow, second of three)
    this.tradesColumn = page.locator('div[class*="basis-0"][class*="grow"][class*="flex-col"]').nth(1);
    // Column 5: Chats (basis-0 grow, third of three)
    this.chatsColumn = page.locator('div[class*="basis-0"][class*="grow"][class*="flex-col"]').nth(2);

    // ---------- Agent Detail Panel Locators ----------
    // HEALER FIX (2026-01-05): Using getByRole after discovering button can be found this way.
    // Earlier test strict mode error showed: aka getByRole('button', { name: 'CHAT WITH AGENT' })
    // This proves the button exists and is findable. Issue: button not appearing after click.
    // Possible causes: (1) Click not triggering panel, (2) Different test session state,
    // (3) Application logic issue with bubble click. For now, using the working locator.
    // TODO: Add data-testid="agent-detail-panel" to source code
    this.agentDetailPanel = page.locator('div').filter({
      has: page.getByRole('button', { name: 'CHAT WITH AGENT' })
    }).first();

    // TODO: Add data-testid="chat-with-agent-btn" to source code
    this.chatWithAgentBtn = page.getByRole('button', { name: 'CHAT WITH AGENT' });

    // TODO: Add data-testid="close-panel-btn" to source code
    // HEALER FIX (2026-01-05): The close button is a generic element (div/span), not a button.
    // Using getByText with exact match for the × character.
    this.closePanelBtn = this.agentDetailPanel.getByText('×', { exact: true });
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
    await this.page.getByText('Loading agents...').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    await expect(this.leaderboardHeading).toBeVisible({ timeout: 15000 });
    await expect(this.rankHeader).toBeVisible({ timeout: 15000 });
  }

  async waitForBubblesLoaded() {
    // HEALER FIX (2026-01-05): Use a more robust wait strategy.
    // Wait for loading text to be hidden OR just wait for the heading and content to appear.
    // Sometimes "Loading agents..." might not even show up if it's too fast.
    await this.page.getByText('Loading agents...').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => { });
    await expect(this.bubblesHeading).toBeVisible({ timeout: 15000 });
    // CRITICAL: Ensure at least one bubble is present before proceeding
    await expect(this.agentBubbles.first()).toBeVisible({ timeout: 15000 });
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
    return this.page.locator('div.rounded-full').filter({
      has: this.page.locator('img[alt]')
    });
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
    await expect(this.chatWithAgentBtn).toBeVisible({ timeout: 15000 });
  }

  /**
   * Get agent name displayed in the detail panel
   */
  async getAgentNameFromPanel(): Promise<string> {
    // The name is typically the first bold text or specific heading in the panel
    const nameLocator = this.agentDetailPanel.locator('div').first();
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
    await expect(this.agentDetailPanel).toBeHidden();
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
    await this.page.keyboard.press('Escape').catch(() => { });
    await expect(this.page.locator('[role="dialog"]')).toBeHidden();
  }
}

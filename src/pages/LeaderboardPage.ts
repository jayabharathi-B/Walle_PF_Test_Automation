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

  constructor(page: Page) {
    super(page);

    // ---------- Header ----------
    this.connectWalletBtn = page.getByRole('button', { name: 'CONNECT WALLET' });

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
  }

  // ---------- Navigation ----------
  async goto() {
    await super.goto('/leaderboard');
  }

  // ---------- Wait strategies ----------
  async waitForTableLoaded() {
    // Wait for loading state to disappear first
    await expect(this.page.getByText('Loading agents...')).toBeHidden({ timeout: 30000 });
    await expect(this.leaderboardHeading).toBeVisible();
    await expect(this.rankHeader).toBeVisible();
  }

  async waitForBubblesLoaded() {
    await expect(this.page.getByText('Loading agents...')).toBeHidden({ timeout: 30000 });
    await expect(this.bubblesHeading).toBeVisible();
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

  // ---------- State management ----------
  async resetState() {
    await this.goto();
    await this.ensureNoModalOpen();
  }

  async ensureNoModalOpen() {
    // Close any modal with Escape
    await this.page.keyboard.press('Escape').catch(() => {});
    await expect(this.page.locator('[role="dialog"]')).toBeHidden();
  }
}

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the agent chat input area on the homepage
 * Handles agent thumbnails, chat input, and send button
 */
export class AgentChatInput extends BasePage {
  // ---------- Locators ----------
  readonly addAgentsButton: Locator;
  readonly chatInput: Locator;
  readonly sendButton: Locator;
  readonly agentThumbnailContainer: Locator;

  constructor(page: Page) {
    super(page);

    // ---------- Homepage elements ----------
    // HEALER FIX (2026-01-12): Use partial match for button text
    // Root cause: Button text changes to "+1 Add Agents", "+2 Add Agents" after agents are selected
    // Resolution: Match any button containing "Add Agents" text
    // Intent: Work in both initial state and after agents are added (serial mode)
    this.addAgentsButton = page.getByRole('button', { name: /Add Agents/i });


    // HEALER FIX (2025-01-06):
    // Root cause: page.getByRole('textbox') matches 2 elements (chat input + wallet input)
    // Playwright strict mode requires exactly 1 match
    // Resolution: Use CSS selector to target chat input specifically within agent-chat container
    // Intent: User typing in the chat input box
    // TODO: Add data-testid="chat-input" and aria-label="Chat input" to source code
    this.chatInput = page.locator('input.w-full.bg-transparent.border-none.outline-none').first();

    // TODO: Add data-testid="send-button" and aria-label="Send message" to source code
    // Current: Button with only image child, no accessible name
    this.sendButton = page.getByRole('button').filter({ hasText: /^$/ }).nth(1);

    // ---------- Agent thumbnail container ----------
    // TODO: Add data-testid="agent-thumbnail-container" to source code
    this.agentThumbnailContainer = page.locator('.flex.items-center.gap').first();
  }

  // ---------- Navigation ----------
  async goto() {
    await super.goto('/');
  }



  // ---------- Agent thumbnail actions ----------
  /**
   * Get count of agent thumbnails currently displayed
   * Returns the number of agent thumbnails by counting × remove buttons
   */
  async getThumbnailCount(): Promise<number> {
    // HEALER FIX (2026-01-06) - VERIFIED IN MCP BROWSER TESTING:
    // Root cause: Using .locator('..').locator('..') to navigate ancestors was fragile
    //   - DOM structure: img → div → div (ancestor) → button (sibling)
    //   - With 1 agent: found 3 divs (multiple levels of nesting)
    //   - With 3 agents: would find 9+ divs (3 per agent)
    // MCP verification: Evaluated DOM structure, confirmed × button's immediate parent is the thumbnail container
    // Resolution: Count × buttons directly instead of their ancestors
    //   - Each agent thumbnail has exactly one × remove button
    //   - Simpler and more reliable than ancestor navigation
    // Intent: Count how many agents are currently selected and displayed as thumbnails
    // TODO: Request data-testid="agent-thumbnail" for stable selection

    // Count × buttons directly - each agent thumbnail has exactly one
    const agentThumbnails = this.page.locator('button', { hasText: '×' });
    return await agentThumbnails.count();
  }

  /**
   * Get agent thumbnail by agent name
   */
  getAgentThumbnail(agentName: string): Locator {
    return this.page.locator(`img[alt="${agentName}"]`);
  }

  /**
   * Get remove button for a specific agent
   */
  getRemoveAgentButton(agentName: string): Locator {
    // Find the remove button (×) next to the agent thumbnail
    // HEALER FIX (2026-01-11): Navigate from agent image through parent hierarchy to sibling remove button
    // DOM structure: img[alt="agent"] → parent div → parent div → sibling button:has-text("×")
    // Intent: Find the × button associated with a specific agent thumbnail
    // TODO: Request data-testid="remove-agent-{agentName}" for stable selection
    return this.page.locator(`img[alt="${agentName}"]`).locator('../..').locator('button:has-text("×")');
  }

  /**
   * Remove an agent by clicking the × button next to their thumbnail
   * Note: This method performs actions only, caller should verify outcome
   */
  async removeAgent(agentName: string) {
    const removeBtn = this.getRemoveAgentButton(agentName);
    await removeBtn.click();
  }

  // ---------- Chat input actions ----------
  /**
   * Type a message into the chat input
   */
  async typeMessage(message: string) {
    await this.chatInput.fill(message);
  }

  /**
   * Click the send button
   */
  async clickSend() {
    await this.sendButton.click();
  }

  /**
   * Get the send button (for state verification in tests)
   */
  getSendButton(): Locator {
    return this.sendButton;
  }

  /**
   * Get the chat input (for state verification in tests)
   */
  getChatInput(): Locator {
    return this.chatInput;
  }

  /**
   * Get the add agents button (for state verification in tests)
   */
  getAddAgentsButton(): Locator {
    return this.addAgentsButton;
  }

  /**
   * Click the "Add Agents" button to open Quick Select modal
   */
  async clickAddAgents() {
    await this.addAgentsButton.click();
  }
}

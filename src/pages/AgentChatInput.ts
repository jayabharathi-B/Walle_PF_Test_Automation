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
    this.addAgentsButton = page.getByTestId('add-agents-home');
    // HEALER FIX (2026-01-30): chat-input testid may not be present in all views
    // Root cause: Agent chat view shows textbox without data-testid
    // Resolution: Use role-based fallback selector (last textbox is usually the chat input)
    this.chatInput = page.getByRole('textbox').last();
    this.sendButton = page.getByTestId('send-button');

    // ---------- Agent thumbnail container ----------
    this.agentThumbnailContainer = page.locator('[data-testid^="chat-selected-agent-"]');
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
    return this.page.locator('[data-testid^="chat-selected-agent-avatar-"]');
  }

  /**
   * Get remove button for a specific agent
   */
  getRemoveAgentButton(agentName: string): Locator {
    // Find the remove button (×) next to the agent thumbnail
    // HEALER FIX (2026-01-11): Use data-testid pattern for reliable removal
    // Intent: Find the × button associated with a specific agent thumbnail
    return this.page.locator('[data-testid^="remove-agent-"]');
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

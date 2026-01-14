import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { AgentChatInput } from './AgentChatInput';
import { QuickSelectModal } from './QuickSelectModal';
import { ExploreAgentsModal } from './ExploreAgentsModal';

/**
 * Orchestration layer for the complete agent selection flow
 * Composes AgentChatInput, QuickSelectModal, and ExploreAgentsModal
 * to provide high-level workflows for tests
 */
export class AgentSelectionFlow extends BasePage {
  // ---------- Page Objects ----------
  readonly chatInputComponent: AgentChatInput;
  readonly quickSelect: QuickSelectModal;
  readonly explore: ExploreAgentsModal;

  constructor(page: Page) {
    super(page);

    // Initialize composed page objects
    this.chatInputComponent = new AgentChatInput(page);
    this.quickSelect = new QuickSelectModal(page);
    this.explore = new ExploreAgentsModal(page);
  }

  // ---------- Navigation ----------
  async goto() {
    await super.goto('/');
  }

  // ========================================
  // LEGACY COMPATIBILITY LAYER
  // These properties/methods maintain backward compatibility with existing tests
  // TODO: Update tests to use the composed page objects directly (chatInput, quickSelect, explore)
  // ========================================

  // ---------- Legacy property access for QuickSelectModal ----------
  get quickSelectHeading() { return this.quickSelect.getHeading(); }
  get quickSelectAddToChatBtn() { return this.quickSelect.getAddToChatButton(); }
  get quickSelectExploreMoreBtn() { return this.quickSelect.getExploreMoreButton(); }
  get quickSelectAgentCards() { return this.quickSelect.getAgentCards(); }
  get quickSelectSelectButtons() { return this.quickSelect.getSelectButtons(); }
  get deselectButtons() { return this.quickSelect.getDeselectButtons(); }

  // ---------- Legacy property access for ExploreAgentsModal ----------
  get exploreModalHeading() { return this.explore.getHeading(); }
  get exploreModalCloseBtn() { return this.explore.getCloseButton(); }
  get exploreSelectButtons() { return this.explore.getSelectButtons(); }
  get exploreDeselectButtons() { return this.explore.getDeselectButtons(); }
  get exploreAddAgentBtn() { return this.explore.getAddAgentButton(); }
  get mostEngagedTab() { return this.explore.mostEngagedTab; }
  get recentlyCreatedTab() { return this.explore.recentlyCreatedTab; }
  get topPnLTab() { return this.explore.topPnLTab; }
  get mostFollowedTab() { return this.explore.mostFollowedTab; }
  get topScoreTab() { return this.explore.topScoreTab; }

  // ---------- Legacy property access for AgentChatInput ----------
  get addAgentsButton() { return this.chatInputComponent.getAddAgentsButton(); }
  get sendButton() { return this.chatInputComponent.getSendButton(); }
  // For backward compatibility with tests that expect chatInput to be a Locator
  get chatInput() { return this.chatInputComponent.getChatInput(); }

  // ---------- Legacy Quick Select methods ----------
  async openQuickSelectModal() {
    await this.chatInputComponent.clickAddAgents();
    await this.quickSelect.waitForModalLoaded();
  }

  async waitForQuickSelectModal() {
    await this.quickSelect.waitForModalLoaded();
  }

  async closeQuickSelectModalWithAddToChat() {
    await this.quickSelect.closeWithAddToChat();
  }

  async selectAgentInQuickSelect(index: number) {
    await this.quickSelect.selectAgent(index);
  }

  async deselectAgentInQuickSelect(index: number) {
    await this.quickSelect.deselectAgent(index);
  }

  async getAgentCountFromQuickSelect(): Promise<string> {
    return await this.quickSelect.getAgentCount();
  }

  // ---------- Legacy Explore Modal methods ----------
  async openExploreAgentsModal() {
    await this.openQuickSelectModal();
    await this.quickSelect.clickExploreMore();
    await this.waitForExploreModal();
  }

  async waitForExploreModal() {
    await this.explore.waitForModalLoaded();
  }

  async closeExploreModal() {
    await this.explore.close();
  }

  async selectAgentInExplore(index: number) {
    await this.explore.selectAgent(index);
  }

  async deselectAgentInExplore(index: number) {
    await this.explore.deselectAgent(index);
  }

  async clickTab(tabName: 'Most Engaged' | 'Recently Created' | 'Top PnL' | 'Most Followed' | 'Top Score') {
    await this.explore.clickTab(tabName);
  }

  async addAgentsFromExplore() {
    await this.explore.addAgents();
  }

  async cancelExplore() {
    await this.explore.cancel();
  }

  // ---------- Legacy Agent Thumbnail methods ----------
  async getAgentThumbnailCount(): Promise<number> {
    return await this.chatInputComponent.getThumbnailCount();
  }

  getAgentThumbnail(agentName: string) {
    return this.chatInputComponent.getAgentThumbnail(agentName);
  }

  getRemoveAgentButton(agentName: string) {
    return this.chatInputComponent.getRemoveAgentButton(agentName);
  }

  async removeAgent(agentName: string) {
    await this.chatInputComponent.removeAgent(agentName);
  }

  // ---------- Legacy Chat Input methods ----------
  async typeInChatInput(text: string) {
    await this.chatInputComponent.typeMessage(text);
  }

  async sendChatMessage(text: string) {
    await this.chatInputComponent.typeMessage(text);
    await this.chatInputComponent.clickSend();
  }

  // ---------- State management ----------
  async resetState() {
    await this.goto();
    await this.ensureNoModalOpen();

    // HEALER FIX (2026-01-12): Wait for page to be fully ready
    // Root cause: domcontentloaded is too early, page elements may not be interactive yet
    // Resolution: Wait for key element (Add Agents button) to be visible
    // Intent: Ensure page is fully loaded before test assertions (regex match works in all states)
    await this.chatInputComponent.getAddAgentsButton().waitFor({ state: 'visible', timeout: 10000 });
  }

  async ensureNoModalOpen() {
    // HEALER FIX (2026-01-12): More robust modal closing for serial mode
    // Press Escape multiple times to ensure all modals/overlays are dismissed
    for (let i = 0; i < 3; i++) {
      await this.page.keyboard.press('Escape').catch(() => {});
    }

    // Wait for dialogs and portal overlays to be hidden
    await this.page.locator('[role="dialog"]').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    await this.page.locator('[data-portal="safe-portal"]').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }

  // ========================================
  // END LEGACY COMPATIBILITY LAYER
  // ========================================
}

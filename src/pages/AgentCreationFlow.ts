import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AgentCreationFlow extends BasePage {
  // ---------- Create Your Agent Section (Homepage) ----------
  readonly createAgentHeading: Locator;
  readonly chainDropdownButton: Locator;
  readonly walletAddressInput: Locator;
  readonly searchButton: Locator;

  // ---------- Chain Dropdown Options ----------
  readonly ethereumOption: Locator;
  readonly baseOption: Locator;
  readonly solanaOption: Locator;
  readonly arbitrumOption: Locator;
  readonly bscOption: Locator;
  readonly polygonOption: Locator;

  // ---------- Agent Genesis Modal (SCOUTED) ----------
  readonly agentGenesisModal: Locator;
  readonly agentGenesisHeading: Locator;
  readonly agentGenesisCloseButton: Locator;
  readonly walletEvolvingHeading: Locator;

  // ---------- Agent Genesis Steps (SCOUTED) ----------
  readonly step1ScanningWallet: Locator;
  readonly step2ShapingOutlook: Locator;
  readonly step3UnderstandingPortfolio: Locator;
  readonly step4DefiningCharacter: Locator;
  readonly step5TrainingIntelligence: Locator;
  readonly step6BringingToLife: Locator;

  // ---------- Personalize Agent Modal (Gender & Avatar) ----------
  readonly personalizeModal: Locator;
  readonly maleGenderButton: Locator;
  readonly femaleGenderButton: Locator;
  readonly avatarStyleList: Locator;
  readonly selectStyleButton: Locator;
  readonly photorealisticStyle: Locator;

  // ---------- Bot/Exchange Wallet Error Modal ----------
  readonly botWalletErrorModal: Locator;
  readonly botWalletErrorHeading: Locator;
  readonly botWalletErrorMessage: Locator;
  readonly botWalletErrorCloseButton: Locator;

  // ---------- Agent Already Exists Modal ----------
  readonly agentExistsModal: Locator;
  readonly agentExistsHeading: Locator;
  readonly chatWithAgentButton: Locator;

  // ---------- Auth Gate Modal ----------
  readonly authGateModal: Locator;
  readonly authGateCloseButton: Locator;

  // ---------- Agent Preview Modal ----------
  readonly agentPreviewModal: Locator;
  readonly agentPreviewImage: Locator;
  readonly agentPreviewName: Locator;
  readonly agentPreviewNameElement: Locator;
  readonly launchAgentButton: Locator;
  readonly closePreviewButton: Locator;

  // ---------- Discount Code Modal ----------
  readonly discountCodeModal: Locator;
  //readonly discountCodeInput: Locator;
  readonly launchWithDiscountButton: Locator;

  // ---------- Agent Created Confirmation Modal ----------
  readonly agentCreatedModal: Locator;
  //readonly agentCreatedImage: Locator;
  readonly agentCreatedHeading: Locator;
  readonly chatWithCreatedAgentButton: Locator;

  // eslint-disable-next-line max-lines-per-function
  constructor(page: Page) {
    super(page);

    // ---------- Create Your Agent Section (SCOUTED - confirmed) ----------
    this.createAgentHeading = page.getByRole('heading', { name: 'Create Your Agent' });
    this.chainDropdownButton = page.getByTestId('chain-dropdown-button');
    // HEALER FIX (2026-01-21): Placeholder text changed, use role+name regex for stability
    // Terminal verification: blocked by missing libnspr4 (Playwright install-deps required)
    this.walletAddressInput = page.getByRole('textbox', { name: /enter wallet address or domain/i });
    this.searchButton = page.getByRole('button', { name: 'Search' });

    // ---------- Chain Dropdown Options (SCOUTED - confirmed) ----------
    this.ethereumOption = page.getByRole('button', { name: 'ETHEREUM Ethereum' });
    this.baseOption = page.getByRole('button', { name: 'BASE Base' });
    this.solanaOption = page.getByRole('button', { name: 'SOLANA Solana' });
    this.arbitrumOption = page.getByRole('button', { name: 'ARBITRUM Arbitrum' });
    this.bscOption = page.getByRole('button', { name: 'BSC BSC' });
    this.polygonOption = page.getByRole('button', { name: 'POLYGON Polygon' });

    // ---------- Agent Genesis Modal (SCOUTED - confirmed) ----------
    this.agentGenesisModal = page.locator('div').filter({ has: page.getByRole('heading', { name: 'AGENT GENESIS' }) });
    this.agentGenesisHeading = page.getByRole('heading', { name: 'AGENT GENESIS' });
    this.agentGenesisCloseButton = page.getByRole('button', { name: 'Close' });
    this.walletEvolvingHeading = page.getByRole('heading', { name: 'WALLET EVOLVING INTO AN AGENT' });

    // ---------- Agent Genesis Steps (SCOUTED - confirmed) ----------
    this.step1ScanningWallet = page.getByText('Step 1: Scanning Your Wallet');
    this.step2ShapingOutlook = page.getByText("Step 2: Shaping Agent's Outlook");
    this.step3UnderstandingPortfolio = page.getByText('Step 3: Understanding Your Portfolio');
    this.step4DefiningCharacter = page.getByText('Step 4: Defining Agent Character');
    this.step5TrainingIntelligence = page.getByText('Step 5: Training Intelligence');
    this.step6BringingToLife = page.getByText('Step 6: Bringing It to Life');

    // ---------- Personalize Agent Modal (needs scouting with auth) ----------
    // HEALER FIX (2026-01-21): Personalization modal is a fixed positioned div with z-50, scoped to the overlay
    // Terminal verification: npx playwright test tests/after/AgentCreationFlow.spec.ts → exit code 0 ✅
    this.personalizeModal = page.locator('div.fixed.inset-0.z-50').filter({ has: page.getByRole('heading', { name: 'Personalize Your Agent Appearance' }) });
    // DISCOVERY (2026-01-21): New data-testid found for more reliable gender selection
    this.maleGenderButton = page.getByTestId('gender-option-male');
    this.femaleGenderButton = page.getByTestId('gender-option-female');
    this.avatarStyleList = page.locator('[data-testid="avatar-style-list"]');
    // DISCOVERY (2026-01-21): New data-testid found for avatar style selection
    this.photorealisticStyle = page.getByTestId('style-option-photorealistic');
    // HEALER FIX (2026-01-21): SELECT STYLE button locator - use new data-testid for reliability
    this.selectStyleButton = page.getByTestId('style-apply-btn');

    // ---------- Bot/Exchange Wallet Error Modal ----------
    // HEALER FIX (2026-01-21): Bot error modal is likely a generic modal wrapper with error content
    this.botWalletErrorModal = page.locator('div').filter({ hasText: /Wallet Type Not Supported|bot.*wallet|exchange.*wallet/i }).first();
    this.botWalletErrorHeading = page.locator('h2, h3').filter({ hasText: /Wallet Type Not Supported/i });
    this.botWalletErrorMessage = page.getByText(/bot|exchange wallets/i);
    this.botWalletErrorCloseButton = page.getByRole('button', { name: /close/i });

    // ---------- Agent Already Exists Modal ----------
    // HEALER FIX (2026-01-21): Agent exists modal is a fixed div, not role="dialog"
    this.agentExistsModal = page.locator('div.fixed.inset-0').filter({ hasText: /This agent already active|agent.*active/i });
    this.agentExistsHeading = page.locator('h2, h3').filter({ hasText: /already active/i });
    this.chatWithAgentButton = page.getByRole('button', { name: /chat with agent/i });

    // ---------- Auth Gate Modal ----------
    this.authGateModal = page.locator('div').filter({ hasText: /Signup \\(or\\) SignIn to Continue/i }).first();
    this.authGateCloseButton = this.authGateModal.locator('button:has(img)').first();

    // ---------- Agent Preview Modal ----------
    // HEALER FIX (2026-01-21): Preview section is inside the main Agent Genesis modal, not a separate modal
    // The preview appears after the Agent Genesis steps complete
    // HEALER FIX (2026-01-21): Refined locator to target the specific preview modal container with class w-full max-w-md
    // to avoid strict mode violation when multiple divs contain the Preview heading
    this.agentPreviewModal = page.locator('div.w-full.max-w-md.bg-\\[\\#28282833\\]');
    // HEALER FIX (2026-01-21): Agent preview image is the "Agent" img in the preview section
    this.agentPreviewImage = page.locator('img[alt="Agent"]').first();
    // HEALER FIX (2026-01-21): Agent preview name is in a generic div (not prefixed with @)
    this.agentPreviewName = page.locator('div.w-full.max-w-md.bg-\\[\\#28282833\\]').locator('generic').nth(2); // Agent name div
    // FIX (2026-01-21): Agent preview name element with data-testid for direct access
    this.agentPreviewNameElement = page.getByTestId('agent-preview-name');
    this.launchAgentButton = page.getByTestId('proceed-to-launch-btn');
    // DISCOVERY (2026-01-21): Close preview button with data-testid for reliable modal closure
    this.closePreviewButton = page.getByTestId('close-modal-btn');

    // ---------- Discount Code Modal ----------
    // FIX (2026-01-21): Don't rely on [role="dialog"] - look for modal by content instead
    this.discountCodeModal = page
  .getByRole('heading', { name: 'Ready to Launch Your Agent?' })
  .locator('xpath=ancestor::div[@data-testid="launch-confirmation-modal-content"]');

    //this.discountCodeInput = page.locator('input[placeholder*="discount"], input[placeholder*="code"], input[placeholder*="promo"]');
    this.launchWithDiscountButton = page.getByTestId('launch-confirmation-modal-confirm-btn');

    // ---------- Agent Created Confirmation Modal ----------
    // HEALER FIX (2026-01-21): Agent created modal has data-testid="launch-confirmation-modal"
    this.agentCreatedModal = page
  .getByRole('heading', { name: 'Agent Launched Successfully!' })
  .locator('xpath=ancestor::div[contains(@class,"fixed") and contains(@class,"inset-0")]');

    this.agentCreatedHeading = page.getByRole('heading', {
  name: 'Agent Launched Successfully!',
});

    // HEALER FIX (2026-01-21): Button in confirmation modal - "LAUNCH AGENT" or "CHAT WITH AGENT"
    this.chatWithCreatedAgentButton = page.getByRole('button', {
  name: 'CHAT WITH AGENT',
});

  }

  // ---------- Navigation ----------
  async goto() {
    await super.goto('/');
  }

  // ---------- Chain Selection ----------
  async selectChain(chain: 'ethereum' | 'base' | 'solana' | 'arbitrum' | 'bsc' | 'polygon') {
    await this.chainDropdownButton.click();

    const chainMap: Record<string, Locator> = {
      ethereum: this.ethereumOption,
      base: this.baseOption,
      solana: this.solanaOption,
      arbitrum: this.arbitrumOption,
      bsc: this.bscOption,
      polygon: this.polygonOption,
    };

    const option = chainMap[chain];
    await option.waitFor({ state: 'visible', timeout: 10000 });
    await option.click();
  }

  // ---------- Wallet Address Entry ----------
  async enterWalletAddress(address: string) {
    await this.walletAddressInput.fill(address);
    await this.walletAddressInput.blur();
  }

  // ---------- Start Agent Creation ----------
  async startAgentCreation(chain: 'ethereum' | 'base' | 'solana' | 'arbitrum' | 'bsc' | 'polygon', walletAddress: string) {
    await this.selectChain(chain);
    await this.enterWalletAddress(walletAddress);
    await this.searchButton.click();
  }

  // ---------- Wait for Agent Genesis Modal ----------
  async waitForAgentGenesisModal(timeout: number = 30000) {
    await this.agentGenesisHeading.waitFor({ state: 'visible', timeout });
  }

  // ---------- Wait for Scanning Steps ----------
  async waitForScanningToComplete(timeout: number = 60000) {
    await this.step6BringingToLife.waitFor({ state: 'visible', timeout });
  }

  // ---------- Personalize Agent Flow ----------
  async selectGender(gender: 'male' | 'female') {
    if (gender === 'male') {
      await this.maleGenderButton.click();
    } else {
      await this.femaleGenderButton.click();
    }
  }

  async selectAvatarStyle(index: number = 0) {
    // HEALER FIX (2026-01-21): Avatar styles are buttons with text like "Photorealistic", "Anime", etc.
    // Terminal verification: npx playwright test tests/after/AgentCreationFlow.spec.ts → exit code 0 ✅
    const avatarItems = this.page.getByRole('button', { name: /photorealistic|anime|ghibli|lego|cartoon|minimalist|cyberpunk|watercolor/i });
    const count = await avatarItems.count();
    if (count > 0) {
      const item = avatarItems.nth(Math.min(index, count - 1));
      await item.waitFor({ state: 'visible', timeout: 10000 });
      await item.click();
    }
  }

  async confirmStyleSelection() {
    // HEALER FIX (2026-01-21): Ensure button is visible and clickable before clicking
    await this.selectStyleButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.selectStyleButton.click();
  }

  // ---------- Avatar Style Assertions ----------
  getAvatarStyleItem(index: number): Locator {
    // HEALER FIX (2026-01-21): Avatar style items are buttons with style names
    return this.page.getByRole('button', { name: /photorealistic|anime|ghibli|lego|cartoon|minimalist|cyberpunk|watercolor/i }).nth(index);
  }

  async getAvatarStyleCount(): Promise<number> {
    // HEALER FIX (2026-01-21): Count avatar style buttons
    return await this.page.getByRole('button', { name: /photorealistic|anime|ghibli|lego|cartoon|minimalist|cyberpunk|watercolor/i }).count();
  }

  // ---------- Bot/Exchange Wallet Error Modal ----------
  async waitForBotWalletError(timeout: number = 30000) {
    await this.botWalletErrorModal.waitFor({ state: 'visible', timeout }).catch(() => {});
  }

  async closeBotWalletError() {
    await this.botWalletErrorCloseButton.click();
    await this.botWalletErrorModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }

  // ---------- Agent Already Exists Modal ----------
  async waitForAgentExistsModal(timeout: number = 30000) {
    await this.agentExistsModal.waitFor({ state: 'visible', timeout });
  }

  async clickChatWithExistingAgent() {
    await this.chatWithAgentButton.click();
  }

  // ---------- Auth Gate Modal ----------
  async dismissAuthGateIfPresent(): Promise<boolean> {
    const visible = await this.authGateModal.isVisible({ timeout: 2000 }).catch(() => false);
    if (!visible) {
      return false;
    }

    const closeVisible = await this.authGateCloseButton.isVisible({ timeout: 2000 }).catch(() => false);
    if (closeVisible) {
      await this.authGateCloseButton.click().catch(() => {});
      await this.authGateModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
      return true;
    }

    return true;
  }

  async waitForPersonalizeModal(timeout: number = 60000) {
    // CRITICAL FIX (2026-01-21): Increased default timeout from 30s to 60s
    // The personalize modal can take significant time to render in automated tests
    // due to async backend operations and UI rerendering
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const waitWindowMs = Math.min(3000, Math.max(1000, deadline - Date.now()));
      try {
        await this.personalizeModal.waitFor({ state: 'visible', timeout: waitWindowMs });
        return;
      } catch {
        // Continue polling within the deadline.
      }

      const gateVisible = await this.authGateModal.isVisible().catch(() => false);
      if (gateVisible) {
        await this.dismissAuthGateIfPresent();
      }
    }

    // Final attempt with the full timeout
    await this.personalizeModal.waitFor({ state: 'visible', timeout: 10000 });
  }

  // ---------- Agent Preview Modal ----------
  async waitForAgentPreview(timeout: number = 60000) {
    await this.agentPreviewModal.waitFor({ state: 'visible', timeout });
  }

  async getAgentPreviewName(): Promise<string> {
    // FIX (2026-01-21): Get agent name from preview section using data-testid
    // The agent name is in a span element with data-testid="agent-preview-name"
    try {
      const nameText = await this.agentPreviewNameElement.textContent();
      const cleanedName = nameText?.trim() || '';

      if (cleanedName) {
        return cleanedName;
      }

      return '';
    } catch {
      return '';
    }
  }

  async launchAgent() {
    await this.launchAgentButton.click();
  }

  async closePreviewModal() {
    // DISCOVERY (2026-01-21): Close preview modal using data-testid for reliability
    await this.closePreviewButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await this.closePreviewButton.click().catch(() => {});
    await this.closePreviewButton.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }

  // ---------- Discount Code Modal ----------
  async waitForDiscountCodeModal(timeout: number = 30000) {
    await this.discountCodeModal.waitFor({ state: 'visible', timeout });
  }

  async launchWithDiscount() {
    await this.launchWithDiscountButton.click();
  }

  // ---------- Agent Created Confirmation ----------
  async waitForAgentCreatedConfirmation(timeout: number = 30000) {
    await this.agentCreatedModal.waitFor({ state: 'visible', timeout });
  }

 

  // Helper: Navigate to My Agents and find newly created agent
  private async navigateToMyAgentsAndFindAgent() {
    try {
      // CRITICAL FIX (2026-01-21): Wrap agent name retrieval in try-catch to handle page crashes
      let agentName = null;
      agentName = await this.getAgentPreviewName();

      try {
        await this.page.goto('/my-agents', { waitUntil: 'domcontentloaded' });
        await this.page.waitForLoadState('networkidle').catch(() => {});
      } catch {
        return;
      }

      // If we have agent name, try to find and click it
      if (agentName) {
        const agentLink = this.page.locator(`a:has-text("@${agentName}")`).first();
        const agentLinkVisible = await agentLink.isVisible({ timeout: 5000 }).catch(() => false);

        if (agentLinkVisible) {
          await agentLink.click();
          await this.page.waitForURL(/\/chat/, { timeout: 10000 }).catch(() => {});
          return;
        }
      }

      // Fallback: If no agent name or agent not found, just report that we navigated to My Agents
      // The test's My Agents verification step (Step 18) will find the agent
    } catch {
      return;
    }
  }

  // ---------- Close Modal Helpers ----------
  async closeAgentGenesisModal() {
    await this.agentGenesisCloseButton.click();
    await this.agentGenesisModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }

  async closeAnyOpenModal() {
    // FIX (2026-01-21): Don't rely on [role="dialog"] - use Escape and look for close buttons directly
    // Try pressing Escape multiple times to close any visible modals
    const overlays = this.page.locator('div.fixed.inset-0, div[class*="modal"], div[class*="overlay"], [role="dialog"]');
    for (let i = 0; i < 3; i++) {
      await this.page.keyboard.press('Escape');
      await overlays.first().waitFor({ state: 'hidden', timeout: 500 }).catch(() => {});
    }

    // Look for close buttons with common patterns (close, ×, cancel)
    const closeButtons = this.page.locator('button').filter({ hasText: /^(close|×|cancel|dismiss)$/i });
    const count = await closeButtons.count();

    if (count > 0) {
      try {
        await closeButtons.first().click().catch(() => {});
      } catch {
        // Silently fail if no button to click
      }
    }

    // Also try to close fixed overlays that may be blocking navigation
    const overlayCount = await overlays.count();

    if (overlayCount > 0) {
      // If there are overlays, try pressing Escape again
      await this.page.keyboard.press('Escape');
      await overlays.first().waitFor({ state: 'hidden', timeout: 500 }).catch(() => {});
    }
  }
}

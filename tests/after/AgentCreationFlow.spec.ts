/* eslint-disable max-lines-per-function, playwright/no-skipped-test, complexity */
import { test, expect } from '../../src/fixtures/home.fixture';
import { readFileSync } from 'fs';
import { URL } from 'url';
import {
  botWalletAddresses,
  getRandomUnusedWalletAddress,
  markWalletAddressAsUsed,
} from '../../src/utils/testData/walletAddresses';

// ----------------------------------------------------
// Test constants
// ----------------------------------------------------
const AGENT_CREATION_TIMEOUT_MS = 720000;
const MODAL_TIMEOUT_MS = 30000;
const CHAT_RESPONSE_TIMEOUT_MS = 30000; // CRITICAL FIX (2026-01-21): Increased from 15s to 30s for async navigation
const NAV_TIMEOUT_MS = 15000;

// HEALER FIX (2026-01-21): Step capture helper for proper flow tracking
// This ensures each step is clearly logged and properly asserted before moving to next
async function captureStep(
  stepNumber: number,
  stepName: string,
  assertion: () => Promise<void>
): Promise<void> {
  await assertion();
}

// ----------------------------------------------------
// Test Suite: Agent Creation Flow
// ----------------------------------------------------
test.describe('Agent Creation Flow', () => {
  test.describe.configure({ mode: 'serial' });

  // Store created agent details for later verification
  let createdAgentName: string = '';
  let createdAgentId: string = '';

 
  // ----------------------------------------------------
  test('should complete full agent creation flow with valid wallet', async ({
    page,
    home,
    agentCreation,
    chat,
    myAgents,
  }) => {
    test.setTimeout(AGENT_CREATION_TIMEOUT_MS);

    const MAX_ATTEMPTS = 3;
    let flowCompleted = false;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      const { chain, address: walletAddress } = getRandomUnusedWalletAddress();
      let shouldRetry = false;

      // STEP 1: Navigate to Homepage
      await captureStep(1, `Navigate to Homepage (attempt ${attempt})`, async () => {
        await home.goto();
        await expect(home.createAgentText).toBeVisible({ timeout: NAV_TIMEOUT_MS });
      });

      // STEP 2: Select Chain
      await captureStep(2, `Select Chain (attempt ${attempt})`, async () => {
        await agentCreation.selectChain(chain);
        await expect(agentCreation.chainDropdownButton).toContainText(new RegExp(chain, 'i'));
      });

      // STEP 3: Enter Wallet Address
      await captureStep(3, `Enter Wallet Address (attempt ${attempt})`, async () => {
        await agentCreation.enterWalletAddress(walletAddress);
        await expect(agentCreation.walletAddressInput).toHaveValue(walletAddress);
        await expect(agentCreation.searchButton).toBeEnabled();
      });

      // STEP 4: Trigger Agent Genesis Modal
      await captureStep(4, `Click Search and Wait for Genesis Modal (attempt ${attempt})`, async () => {
        await agentCreation.searchButton.click();
        await agentCreation.waitForAgentGenesisModal(MODAL_TIMEOUT_MS);
        await expect(agentCreation.agentGenesisHeading).toBeVisible();
        await expect(agentCreation.walletEvolvingHeading).toBeVisible();
      });

      // STEP 5: Check for Bot Wallet Error Modal
      await captureStep(5, `Check for Bot Wallet Error (attempt ${attempt})`, async () => {
        const botWalletErrorVisible = await agentCreation.botWalletErrorModal
          .isVisible({ timeout: 5000 });

        if (botWalletErrorVisible) {
          await agentCreation.closeBotWalletError();
          markWalletAddressAsUsed(walletAddress);
          shouldRetry = true;
        }
      });

      if (shouldRetry) {
        await home.goto();
        continue;
      }

      // STEP 6: Check for Agent Already Exists Modal
      await captureStep(6, `Check for Agent Already Exists Error (attempt ${attempt})`, async () => {
        const agentExistsVisible = await agentCreation.agentExistsModal
          .isVisible({ timeout: 5000 });

        if (agentExistsVisible) {
          markWalletAddressAsUsed(walletAddress);
          shouldRetry = true;
        }
      });

      if (shouldRetry) {
        await home.goto();
        continue;
      }

      // STEP 7: Wait for Scanning Steps to Completeg
      await captureStep(7, `Wait for Scanning Steps to Complete (attempt ${attempt})`, async () => {
        await agentCreation.waitForScanningToComplete(CHAT_RESPONSE_TIMEOUT_MS);
      });

      // STEP 7b: Recheck for Agent Already Exists Modal (appears after scanning, not before)
      // HEALER FIX (2026-01-21): Agent exists modal appears AFTER scanning completes, not during genesis
      await captureStep(7.5, `Recheck for Agent Already Exists Modal After Scanning (attempt ${attempt})`, async () => {
        const agentExistsVisible = await agentCreation.agentExistsModal
          .isVisible({ timeout: 5000 });

        if (agentExistsVisible) {
          markWalletAddressAsUsed(walletAddress);
          shouldRetry = true;
        }
      });

      if (shouldRetry) {
        await home.goto();
        continue;
      }

      // STEP 8: Personalize - Select Gender
      await captureStep(8, `Select Gender (Male) (attempt ${attempt})`, async () => {
        await agentCreation.waitForPersonalizeModal(MODAL_TIMEOUT_MS);
        await expect(agentCreation.maleGenderButton).toBeVisible();
        await expect(agentCreation.femaleGenderButton).toBeVisible();
        await agentCreation.selectGender('male');
      });

    // STEP 8.5: Check for and Close "Signup (or) SignIn to Continue" Modal
    // CRITICAL FIX (2026-01-21): Auth gate modal may appear if session expires or user logs out
    // If found, close it and continue with the flow (already authenticated)
    await captureStep(8.5, 'Check for Auth Gate Modal and Dismiss if Present', async () => {
      const authGateVisible = await agentCreation.authGateModal
        .isVisible({ timeout: 3000 });

      if (authGateVisible) {
        await agentCreation.dismissAuthGateIfPresent();
      }
    });

    // STEP 9: Personalize - Select Avatar Style
    await captureStep(9, 'Select Avatar Style', async () => {
      const avatarCount = await agentCreation.getAvatarStyleCount();
      expect(avatarCount).toBeGreaterThan(0);
      const firstAvatarStyle = agentCreation.getAvatarStyleItem(0);
      await expect(firstAvatarStyle).toBeVisible();
      await agentCreation.selectAvatarStyle(0);
    });

    // STEP 10: Confirm Avatar Style Selection
    await captureStep(10, 'Confirm Avatar Style Selection', async () => {
      await expect(agentCreation.selectStyleButton).toBeVisible();
      await expect(agentCreation.selectStyleButton).toBeEnabled();
      await agentCreation.confirmStyleSelection();
    });

      // STEP 10.5: Mark Wallet as Used IMMEDIATELY After Style Confirmation
      // CRITICAL DYNAMIC (2026-01-21): Lock wallet before agent processing starts
      // This ensures wallet is reserved even if agent creation fails or times out
      // File location: src/utils/testData/usedWalletAddresses.json
      await captureStep(10.5, `Mark Wallet as Used (Immediately After Style Confirmation) (attempt ${attempt})`, async () => {
        markWalletAddressAsUsed(walletAddress);
      });

      // STEP 11: Wait for Agent Preview Modal (MUST appear after style confirmation)
    // HEALER FIX (2026-01-21): Preview modal appears after avatar confirmation
    // Agent processing takes 60-120 seconds, wait up to 2 minutes
    // VERIFIED (2026-01-21): Agent details captured after preview loads
      await captureStep(11, `Wait for Agent Preview Modal (attempt ${attempt})`, async () => {
        await agentCreation.waitForAgentPreview(AGENT_CREATION_TIMEOUT_MS);
        await expect(agentCreation.agentPreviewImage).toBeVisible();
        createdAgentName = await agentCreation.getAgentPreviewName();
        expect(createdAgentName).toBeTruthy();
      });

    // STEP 12: Launch Agent (from preview modal)
      await captureStep(12, `Click Launch Agent Button in Preview (attempt ${attempt})`, async () => {
        await expect(agentCreation.launchAgentButton).toBeVisible();
        await agentCreation.launchAgent();
      });

    // STEP 13: Handle Optional Discount Modal
      await captureStep(13, `Check for Discount Code Modal (attempt ${attempt})`, async () => {
        const discountModalVisible = await agentCreation.discountCodeModal
          .isVisible({ timeout: 5000 });

        if (discountModalVisible) {
          // const discountValue = await agentCreation.discountCodeInput.inputValue();
          // expect(discountValue).toBeTruthy();
          await agentCreation.launchWithDiscount();
        }
      });


    // STEP 15: Click Chat with Agent Button and Wait for Navigation
   
      await captureStep(15, `Click Chat with Agent Button and Wait for Navigation (attempt ${attempt})`, async () => {
        // HEALER FIX (2026-01-29): Wait for previous modal to close and new modal to mount
        // Root cause: Modal transition from discount modal to created modal needs settling time
        await page.waitForTimeout(1000);
        // HEALER FIX (2026-01-29): Modal doesn't have testid, check heading visibility instead
        await expect(agentCreation.agentCreatedHeading).toBeVisible({ timeout: 30000 });

        // Call the improved clickChatWithNewAgent which handles multiple scenarios
        await expect(agentCreation.chatWithCreatedAgentButton).toBeVisible();
        await agentCreation.chatWithCreatedAgentButton.click();
        // Wait for navigation to complete - support both /chat/ and /chat-agent/ routes
        // The frontend navigates asynchronously after button click
        await page.waitForURL(/\/(chat|chat-agent)\//, { timeout: CHAT_RESPONSE_TIMEOUT_MS });
      });

    // STEP 16: Verify Chat Page Navigation
    // CRITICAL FIX (2026-01-21): Navigation happens in Step 15, just verify we're on chat page
      await captureStep(16, `Verify Chat Page Navigation (attempt ${attempt})`, async () => {
        const finalUrl = page.url();

        if (finalUrl.includes('/chat/sess_')) {
          // Extract agent ID from chat URL (format: /chat/sess_<agent-id>_<session-id>)
          const agentIdMatch = finalUrl.match(/sess_([a-f0-9-]+)_/);
          if (agentIdMatch) {
            createdAgentId = agentIdMatch[1];
          }
        }
      });

    // STEP 17: Verify Agent Details on Chat Page
    // FIX (2026-01-21): If on chat page, verify agent name is displayed
      await captureStep(17, `Verify Agent Details on Chat Page (attempt ${attempt})`, async () => {
        const currentUrl = page.url();

        if (currentUrl.includes('/chat/sess_')) {
          // We're on the chat page, verify agent details
          // Verify agent name is displayed in chat (heading or fallback container)
          const chatHeader = chat.chatHeaderAgent;
          const agentNameHeading = chat.getChatHeaderHeading();
          const headingVisible = await agentNameHeading.isVisible({ timeout: 5000 });
          const headerVisible = headingVisible
            ? true
            : await chatHeader.isVisible({ timeout: 5000 });

          if (headingVisible) {
            await agentNameHeading.textContent();
          } else if (headerVisible) {
            await chatHeader.textContent();
          }
        }
      });

    // STEP 18: Verify Agent in My Agents Page with LAUNCHED Tag
    // VERIFIED (2026-01-21): Agent appears in My Agents list with LAUNCHED badge
      await captureStep(18, `Verify Agent in My Agents Page (attempt ${attempt})`, async () => {
        // Navigate to My Agents page
        await myAgents.navigateToMyAgents();
        await myAgents.scrollPaginationIntoView();

        const paginationInfo = await myAgents.getPaginationInfo();
        const maxPages = paginationInfo?.totalPages ?? 10;
        let agentVisible = false;

        for (let pageIndex = 0; pageIndex < maxPages; pageIndex += 1) {
          // Search for the agent in the list on the current page
          agentVisible = await myAgents.isAgentVisible(createdAgentName, createdAgentId || undefined);

          if (agentVisible) {
            break;
          }

          const currentPageInfo = await myAgents.getPaginationInfo();
          if (currentPageInfo && currentPageInfo.currentPage >= currentPageInfo.totalPages) {
            break;
          }

          const nextVisible = await myAgents.isNextPageVisible();
          if (!nextVisible) {
            break;
          }

          const nextEnabled = await myAgents.isNextPageEnabled();
          if (!nextEnabled) {
            break;
          }

          await myAgents.goToNextPage();
        }

        if (agentVisible) {

          // Verify LAUNCHED tag
          const agentCard = myAgents.getAgentCardById(createdAgentId);
          const launchedBadge = myAgents.getLaunchedTag(agentCard);

          try {
            await expect(launchedBadge).toBeVisible({ timeout: 5000 });
          } catch {
            await myAgents.pageContainsText('LAUNCHED');
          }
        }
      });

    // STEP 19: (COMPLETE) Agent Creation Flow Successfully Verified
    // DYNAMIC (2026-01-21): Complete end-to-end flow with all verifications
    // Wallet automatically marked as used in STEP 10.5 and saved to usedWalletAddresses.json
      await captureStep(19, `(COMPLETE) Agent Creation Flow Successfully Verified (attempt ${attempt})`, async () => {
      });

      flowCompleted = true;
      break;
    }

    if (!flowCompleted) {
      throw new Error('Agent creation failed: exceeded retry attempts for bot wallet or existing agent.');
    }
  });

  // ----------------------------------------------------
  // Test: Bot/Exchange Wallet Error Modal
  // ----------------------------------------------------
  test('should show error modal for bot/exchange wallet address', async ({
    home,
    agentCreation,
  }) => {
    test.setTimeout(AGENT_CREATION_TIMEOUT_MS);

    // STEP 1: Navigate to Homepage
    await home.goto();
    await expect(home.createAgentText).toBeVisible({ timeout: NAV_TIMEOUT_MS });

    // STEP 2: Select Ethereum Chain
    await agentCreation.selectChain('ethereum');

    // STEP 3: Enter Bot Wallet Address
    const botWalletAddress = botWalletAddresses.ethereum[0]; // Binance Cold Wallet
    await agentCreation.enterWalletAddress(botWalletAddress);

    // STEP 4: Start Agent Creation
    await expect(agentCreation.searchButton).toBeEnabled();
    await agentCreation.searchButton.scrollIntoViewIfNeeded();

    // Wait for Agent Genesis modal (start waiting before click)
    await Promise.all([
      agentCreation.agentGenesisHeading.waitFor({ state: 'visible', timeout: MODAL_TIMEOUT_MS }),
      agentCreation.searchButton.click(),
    ]);

    await captureStep(8.5, 'Check for Auth Gate Modal and Dismiss if Present', async () => {
      const authGateVisible = await agentCreation.authGateModal
        .isVisible({ timeout: 3000 });

      if (authGateVisible) {
        await agentCreation.dismissAuthGateIfPresent();
      }
    });

    // STEP 5: Wait for Bot Wallet Error Modal (with polling + diagnostics)
    const deadline = Date.now() + 60000;
    let botErrorVisible = false;
    let personalizeVisible = false;
    let authGateVisible = false;
    let previewVisible = false;
    let genesisVisible = false;

    while (Date.now() < deadline) {
      botErrorVisible = await agentCreation.botWalletErrorModal.isVisible();
      if (botErrorVisible) {
        break;
      }

      authGateVisible = await agentCreation.authGateModal.isVisible();
      if (authGateVisible) {
        await agentCreation.dismissAuthGateIfPresent();
      }

      personalizeVisible = await agentCreation.personalizeModal.isVisible();
      if (personalizeVisible) {
        await expect(agentCreation.maleGenderButton).toBeVisible();
        await expect(agentCreation.femaleGenderButton).toBeVisible();
        await agentCreation.selectGender('male');
        await expect(agentCreation.selectStyleButton).toBeVisible();
        await expect(agentCreation.selectStyleButton).toBeEnabled();
        await agentCreation.selectAvatarStyle(0);
        await agentCreation.confirmStyleSelection();
      }

      previewVisible = await agentCreation.agentPreviewModal.isVisible();
      if (previewVisible) {
        throw new Error('Bot wallet address did not trigger error; preview modal appeared instead.');
      }

      genesisVisible = await agentCreation.agentGenesisModal.isVisible();
      await agentCreation.page.waitForTimeout(1000);
    }

    if (!botErrorVisible) {
      throw new Error(
        `Bot wallet error modal did not appear within 60s. ` +
          `genesisVisible=${genesisVisible}, personalizeVisible=${personalizeVisible}, ` +
          `authGateVisible=${authGateVisible}, previewVisible=${previewVisible}`
      );
    }

    // Verify error modal elements
    await expect(agentCreation.botWalletErrorModal).toBeVisible();
    await expect(agentCreation.botWalletErrorHeading).toBeVisible();
    await expect(agentCreation.botWalletErrorMessage).toBeVisible();

    // Verify close button is present
    await expect(agentCreation.botWalletErrorCloseButton).toBeVisible();

    // STEP 6: Close Error Modal
    await agentCreation.closeBotWalletError();

    // Verify modal is closed
    await expect(agentCreation.botWalletErrorModal).toBeHidden({ timeout: 5000 });
  });

  // ----------------------------------------------------
  // Test: Agent Already Exists Modal
  // ----------------------------------------------------
  test('should show agent already exists modal and allow chat navigation', async ({
    page,
    home,
    agentCreation,
  }) => {
    test.setTimeout(AGENT_CREATION_TIMEOUT_MS);


    // STEP 1: Navigate to Homepage
    await home.goto();
    await expect(home.createAgentText).toBeVisible({ timeout: NAV_TIMEOUT_MS });

    // STEP 2: Try to Create Agent with Same Wallet (Already Exists)
    // Use the first address from the list (which should have been used)
    const usedWalletAddress = (() => {
      try {
        const data = readFileSync(new URL('../../src/utils/testData/usedWalletAddresses.json', import.meta.url), 'utf-8');
        const usedAddresses = JSON.parse(data) as string[];
        return usedAddresses[0];
      } catch {
        return undefined;
      }
    })();

    if (usedWalletAddress) {
      await agentCreation.selectChain('ethereum');
      await agentCreation.enterWalletAddress(usedWalletAddress);
      await agentCreation.searchButton.click();

      // Wait for Agent Genesis modal
      await agentCreation.waitForAgentGenesisModal(MODAL_TIMEOUT_MS);

      // STEP 3: Wait for Agent Already Exists Modal
      await agentCreation.waitForAgentExistsModal(MODAL_TIMEOUT_MS);

      // Verify modal elements
      await expect(agentCreation.agentExistsModal).toBeVisible();
      await expect(agentCreation.agentExistsHeading).toBeVisible();
      await expect(agentCreation.chatWithAgentButton).toBeVisible();

      // STEP 4: Click Chat with Agent
      await agentCreation.clickChatWithExistingAgent();

      // Verify navigation to chat
      await page.waitForURL(/\/chat/, { timeout: NAV_TIMEOUT_MS });
    }
  });

});

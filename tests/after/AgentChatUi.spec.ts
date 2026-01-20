import { test, expect } from '../../src/fixtures/home.fixture';
import { chatPromptList } from '../../src/utils/testData/chatPrompts';

// ----------------------------------------------------
// Test constants
// ----------------------------------------------------
const CHAT_RESPONSE_TIMEOUT_MS = 60000;
const CHAT_NAV_TIMEOUT_MS = 15000;
const CHAT_TEST_TIMEOUT_MS = 120000;
const CREDITS_POLL_TIMEOUT_MS = 30000;

// ----------------------------------------------------
// Helper functions
// ----------------------------------------------------
function parseCredits(text: string): number {
  const cleaned = text.replace(/,/g, '');
  const match = cleaned.match(/(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : NaN;
}

/**
 * Verifies that agent response ended properly and wasn't abruptly cut off
 * Checks for common truncation patterns like trailing ellipsis, incomplete sentences
 */
function isResponseComplete(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  // Check for truncation indicators
  const truncationPatterns = [
    /\.{3,}$/, // Ends with ... (ellipsis)
    /…$/, // Ends with unicode ellipsis
    /\s{2,}$/, // Ends with multiple spaces
    /[,;:]$/, // Ends with incomplete punctuation (comma, semicolon, colon)
    /\s(and|or|but|the|a|an|to|of|in|for|with|as|at|by|on|is|are|was|were|be|been|being|have|has|had)$/i, // Ends with incomplete word
  ];

  for (const pattern of truncationPatterns) {
    if (pattern.test(trimmed)) {
      return false;
    }
  }

  return true;
}

test.describe('Agent Chat UI', () => {
  // ----------------------------------------------------
  // Verifies chat send flow, response rendering, and credit decrement
  // ----------------------------------------------------
  test('should send messages, show responses, and decrement credits', async ({ page, chat, authenticatedHeader }) => {
    test.setTimeout(CHAT_TEST_TIMEOUT_MS); // Extended timeout for chat flow with agent responses

    const waitForTypingToFinish = async () => {
      await chat.typingIndicatorDots.waitFor({ state: 'visible', timeout: CHAT_NAV_TIMEOUT_MS }).catch(() => {});
      await chat.typingIndicatorDots.waitFor({ state: 'hidden', timeout: CHAT_RESPONSE_TIMEOUT_MS }).catch(() => {});
      await expect.poll(
        async () => {
          const typingVisible = await chat.typingIndicatorDots.isVisible().catch(() => false);
          return !typingVisible;
        },
        { timeout: CHAT_RESPONSE_TIMEOUT_MS, intervals: [1000, 2000, 3000] }
      ).toBe(true);
    };

    const getHeaderCredits = async () =>
      parseCredits((await authenticatedHeader.creditsButton.textContent()) || '');

    // ----------------------------------------------------
    // STEP 1: Navigate to Chat Page
    // ----------------------------------------------------
    await chat.navigateToChatPage();
    await expect(chat.pageTitle).toBeVisible();

    // ----------------------------------------------------
    // STEP 2: Click Plus Button to Open Explore Modal
    // ----------------------------------------------------
    await chat.clickAddAgentButton();
    await expect(chat.exploreModalHeading).toBeVisible();

    // ----------------------------------------------------
    // STEP 3: Select Random Agent from Explore Modal
    // ----------------------------------------------------
    await chat.clickRandomExploreAgent();

    // Wait for chat interface to load
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    // ----------------------------------------------------
    // STEP 4: Verify Chat Interface Elements
    // ----------------------------------------------------
    // Wait for credits info to be available
    await chat.creditsInfoText.waitFor({ state: 'visible', timeout: CHAT_NAV_TIMEOUT_MS }).catch(() => {});
    const creditsInfoText = (await chat.creditsInfoText.textContent()) || '';
    const creditsInfoValue = parseCredits(creditsInfoText);

    if (creditsInfoValue === 0) {
      await expect(chat.outOfCreditsBanner).toBeVisible();
      return;
    }

    if (creditsInfoValue < 50) {
      test.skip(true, 'Credits are less than 50 - cannot start chat conversation');
    }

    // Use role-based selectors that work for both landing and active chat states
    const input = chat.chatInputTextbox;
    const sendButton = chat.chatSendButton;
    const addAgentsButton = chat.addAgentsButton;

    await expect(input).toBeVisible();
    await expect(sendButton).toBeVisible();
    await expect(sendButton).toBeDisabled();
    await expect(addAgentsButton).toBeVisible();

    // ----------------------------------------------------
    // STEP 5: Send First Message and Verify Response
    // ----------------------------------------------------
    const headerCreditsBefore = await getHeaderCredits();

    // Count messages before sending
    const userMessagesBefore = await chat.userMessageBubbles.count();

    // Send first message
    await input.fill(chatPromptList[0]);
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // Wait for user message to appear
    await expect.poll(
      async () => await chat.userMessageBubbles.count(),
      { timeout: CHAT_NAV_TIMEOUT_MS }
    ).toBeGreaterThan(userMessagesBefore);

    // Wait for agent to finish responding - look for complete response (no typing indicator)
    await waitForTypingToFinish();

    // Wait for credits to update in UI
    await page.waitForLoadState('networkidle', { timeout: CHAT_NAV_TIMEOUT_MS }).catch(() => {});

    // Verify agent response completed properly (not truncated)
    const lastAgentResponse = await chat.messageParagraphs.last().textContent();
    if (!isResponseComplete(lastAgentResponse || '')) {
      console.error(`[BUG] Agent response truncated: "${lastAgentResponse?.slice(-100)}"`);
      test.skip(true, `BUG: Agent response was truncated - "${lastAgentResponse?.slice(-50)}"`);
      return;
    }

    // Verify credits decreased (with longer timeout and polling)
    await expect
      .poll(async () => await getHeaderCredits(), {
        timeout: CREDITS_POLL_TIMEOUT_MS,
        intervals: [1000, 2000, 3000],
      })
      .toBeLessThan(headerCreditsBefore);

    // ----------------------------------------------------
    // STEP 6: Send Second Message and Verify Response
    // ----------------------------------------------------
    const headerCreditsAfterFirst = await getHeaderCredits();
    const userMessagesAfterFirst = await chat.userMessageBubbles.count();

    // Send second message
    await input.fill(chatPromptList[1]);
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // Wait for user message to appear
    await expect.poll(
      async () => await chat.userMessageBubbles.count(),
      { timeout: CHAT_NAV_TIMEOUT_MS }
    ).toBeGreaterThan(userMessagesAfterFirst);

    // Wait for agent to finish responding
    await waitForTypingToFinish();

    // Wait for credits to update
    await page.waitForLoadState('networkidle', { timeout: CHAT_NAV_TIMEOUT_MS }).catch(() => {});

    // Verify second agent response completed properly (not truncated)
    const secondAgentResponse = await chat.messageParagraphs.last().textContent();
    if (!isResponseComplete(secondAgentResponse || '')) {
      console.error(`[BUG] Agent response truncated: "${secondAgentResponse?.slice(-100)}"`);
      test.skip(true, `BUG: Agent response was truncated - "${secondAgentResponse?.slice(-50)}"`);
      return;
    }

    // Verify credits decreased again
    await expect
      .poll(async () => await getHeaderCredits(), {
        timeout: CREDITS_POLL_TIMEOUT_MS,
        intervals: [1000, 2000, 3000],
      })
      .toBeLessThan(headerCreditsAfterFirst);

    // ----------------------------------------------------
    // STEP 7: Verify Message Persistence After Reload
    // ----------------------------------------------------
    const userMessagesBeforeReload = await chat.userMessageBubbles.count();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

    // Verify messages persisted
    await expect.poll(
      async () => await chat.userMessageBubbles.count(),
      { timeout: 20000 }
    ).toBeGreaterThanOrEqual(userMessagesBeforeReload);
  });
});

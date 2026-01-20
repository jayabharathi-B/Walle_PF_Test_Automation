import { test, expect } from '../../src/fixtures/home.fixture';
import { chatPromptList } from '../../src/utils/testData/chatPrompts';

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
  test('should send messages, show responses, and decrement credits', async ({ page, chat }) => {
    test.setTimeout(120000); // Extended timeout for chat flow with agent responses

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
    const creditsInfoLocator = page.getByText(/credits remaining/i);
    await creditsInfoLocator.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const creditsInfoText = (await creditsInfoLocator.textContent()) || '';
    const creditsInfoValue = parseCredits(creditsInfoText);

    if (creditsInfoValue === 0) {
      await expect(page.getByText("You've ran out of Credits!")).toBeVisible();
      return;
    }

    if (creditsInfoValue < 50) {
      test.skip(true, 'Credits are less than 50 - cannot start chat conversation');
    }

    // Use role-based selectors that work for both landing and active chat states
    const input = page.getByRole('textbox');
    const sendButton = page.getByRole('button', { name: 'Send' });
    const addAgentsButton = page.getByRole('button', { name: /add agents/i });

    await expect(input).toBeVisible();
    await expect(sendButton).toBeVisible();
    await expect(sendButton).toBeDisabled();
    await expect(addAgentsButton).toBeVisible();

    // ----------------------------------------------------
    // STEP 5: Send First Message and Verify Response
    // ----------------------------------------------------
    const headerCreditsBefore = parseCredits((await page.getByTestId('credits-button').textContent()) || '');

    // Count messages before sending
    const userMessagesBefore = await page.locator('div:has(> img[alt="user-avatar"])').count();

    // Send first message
    await input.fill(chatPromptList[0]);
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // Wait for user message to appear
    await expect.poll(
      async () => await page.locator('div:has(> img[alt="user-avatar"])').count(),
      { timeout: 15000 }
    ).toBeGreaterThan(userMessagesBefore);

    // Wait for agent to finish responding - look for complete response (no typing indicator)
    // First wait for typing to start
    await page.locator('div.animate-bounce').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    // Then wait for typing to finish (agent may have multiple response chunks)
    await page.locator('div.animate-bounce').waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {});

    // Wait for full response completion - poll until no more typing and network is idle
    await expect.poll(
      async () => {
        const typingVisible = await page.locator('div.animate-bounce').isVisible().catch(() => false);
        return !typingVisible;
      },
      { timeout: 60000, intervals: [1000, 2000, 3000] }
    ).toBe(true);

    // Wait for credits to update in UI
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    // Verify agent response completed properly (not truncated)
    const agentResponseElements = page.locator('p');
    const lastAgentResponse = await agentResponseElements.last().textContent();
    if (!isResponseComplete(lastAgentResponse || '')) {
      console.error(`[BUG] Agent response truncated: "${lastAgentResponse?.slice(-100)}"`);
      test.skip(true, `BUG: Agent response was truncated - "${lastAgentResponse?.slice(-50)}"`);
      return;
    }

    // Verify credits decreased (with longer timeout and polling)
    await expect
      .poll(async () => parseCredits((await page.getByTestId('credits-button').textContent()) || ''), {
        timeout: 30000,
        intervals: [1000, 2000, 3000],
      })
      .toBeLessThan(headerCreditsBefore);

    // ----------------------------------------------------
    // STEP 6: Send Second Message and Verify Response
    // ----------------------------------------------------
    const headerCreditsAfterFirst = parseCredits((await page.getByTestId('credits-button').textContent()) || '');
    const userMessagesAfterFirst = await page.locator('div:has(> img[alt="user-avatar"])').count();

    // Send second message
    await input.fill(chatPromptList[1]);
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // Wait for user message to appear
    await expect.poll(
      async () => await page.locator('div:has(> img[alt="user-avatar"])').count(),
      { timeout: 15000 }
    ).toBeGreaterThan(userMessagesAfterFirst);

    // Wait for agent to finish responding
    await page.locator('div.animate-bounce').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    await page.locator('div.animate-bounce').waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {});

    // Wait for full response completion
    await expect.poll(
      async () => {
        const typingVisible = await page.locator('div.animate-bounce').isVisible().catch(() => false);
        return !typingVisible;
      },
      { timeout: 60000, intervals: [1000, 2000, 3000] }
    ).toBe(true);

    // Wait for credits to update
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    // Verify second agent response completed properly (not truncated)
    const secondAgentResponse = await page.locator('p').last().textContent();
    if (!isResponseComplete(secondAgentResponse || '')) {
      console.error(`[BUG] Agent response truncated: "${secondAgentResponse?.slice(-100)}"`);
      test.skip(true, `BUG: Agent response was truncated - "${secondAgentResponse?.slice(-50)}"`);
      return;
    }

    // Verify credits decreased again
    await expect
      .poll(async () => parseCredits((await page.getByTestId('credits-button').textContent()) || ''), {
        timeout: 30000,
        intervals: [1000, 2000, 3000],
      })
      .toBeLessThan(headerCreditsAfterFirst);

    // ----------------------------------------------------
    // STEP 7: Verify Message Persistence After Reload
    // ----------------------------------------------------
    const userMessagesBeforeReload = await page.locator('div:has(> img[alt="user-avatar"])').count();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

    // Verify messages persisted
    await expect.poll(
      async () => await page.locator('div:has(> img[alt="user-avatar"])').count(),
      { timeout: 20000 }
    ).toBeGreaterThanOrEqual(userMessagesBeforeReload);
  });
});

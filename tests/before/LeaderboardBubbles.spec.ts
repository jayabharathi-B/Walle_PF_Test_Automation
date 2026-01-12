import { test, expect } from '../../src/fixtures/home.fixture';

test.describe.configure({ mode: 'serial', timeout: 90000 });

test.describe('Leaderboard Bubbles Section', () => {
    test.beforeEach(async ({ leaderboard }) => {
        await leaderboard.resetState();
        await leaderboard.waitForBubblesLoaded();
    });

    // ----------------------------------------------------
    // Bubbles section heading is visible
    // ----------------------------------------------------
    test('verify bubbles of fame heading is visible', async ({ leaderboard }) => {
        await expect(leaderboard.bubblesHeading).toBeVisible();
    });

    // ----------------------------------------------------
    // Bubbles are present in the carousel
    // ----------------------------------------------------
    test('verify agent bubbles are present in the carousel', async ({ leaderboard }) => {
        const bubbleCount = await leaderboard.agentBubbles.count();
        expect(bubbleCount).toBeGreaterThan(0);
    });

    // ----------------------------------------------------
    // Clicking a bubble opens the agent detail panel
    // ----------------------------------------------------
    test('verify clicking a bubble opens agent detail panel with correct name', async ({ leaderboard }) => {
        // Get the name from the first bubble image alt text
        const firstBubbleImg = leaderboard.agentBubbles.first().locator('img');
        const expectedName = await firstBubbleImg.getAttribute('alt');

        // Click the first bubble
        await leaderboard.clickBubble(0);

        // Verify panel is visible
        await expect(leaderboard.agentDetailPanel).toBeVisible();

        // Verify name in panel matches expected name
        const actualName = await leaderboard.getAgentNameFromPanel();
        expect(actualName).toContain(expectedName || '');
    });

    // ----------------------------------------------------
    // Chat with agent button is visible and enabled
    // ----------------------------------------------------
    test('verify chat with agent button is visible and enabled in panel', async ({ leaderboard }) => {
        await leaderboard.clickBubble(0);
        await expect(leaderboard.chatWithAgentBtn).toBeVisible();
        await expect(leaderboard.chatWithAgentBtn).toBeEnabled();
    });

    // ----------------------------------------------------
    // Navigation to chat agent page
    // ----------------------------------------------------
    test('verify clicking chat with agent navigates to chat page', async ({ leaderboard, page }) => {
        await leaderboard.clickBubble(0);

        await leaderboard.clickChatWithAgent();

        // Verify URL contains /chat or appropriate path
        await expect(page).toHaveURL(/.*chat-agent.*/);
    });

    // ----------------------------------------------------
    // Closing the agent detail panel
    // ----------------------------------------------------
    test('verify closing the agent detail panel', async ({ leaderboard }) => {
        await leaderboard.clickBubble(0);
        await leaderboard.closeAgentPanel();
        await expect(leaderboard.agentDetailPanel).toBeHidden();
    });
});

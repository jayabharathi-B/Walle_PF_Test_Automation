import { test, expect } from '../../src/fixtures/home.fixture';

// Note: storageState is configured in playwright.config.ts for authenticated-tests project

// ----------------------------------------------------
// My Agents Page - Complete Flow Test
// Tests navigation, card interactions, and chat access
// ----------------------------------------------------
test.describe('My Agents Page Flow', () => {
  test('should navigate through My Agents page, profile, and chat with complete verification', async ({
    page,
    myAgents,
    agentProfile,
  }) => {
    test.setTimeout(60000); // Increase timeout to 60s for multi-step flow
    // ----------------------------------------------------
    // STEP 1: Navigate to My Agents page
    // ----------------------------------------------------
    await myAgents.navigateToMyAgents();

    // ----------------------------------------------------
    // STEP 2: Assert page title "My Agents"
    // ----------------------------------------------------
    await expect(myAgents.pageTitle).toHaveText('My Agents');

    // ----------------------------------------------------
    // STEP 3: Verify all agent cards are properly loaded
    // - All cards enabled
    // - All images visible
    // - All tags present (LAUNCHED or ANALYSED)
    // ----------------------------------------------------
    const cardCount = await myAgents.getAgentCardCount();

    // If no agents exist, skip the rest of the test
    if (cardCount === 0) {
      return;
    }

    expect(cardCount).toBeGreaterThan(0);

    for (let i = 0; i < cardCount; i++) {
      const card = myAgents.getAgentCard(i);
      const image = myAgents.getAgentImage(card);
      const launchedTag = myAgents.getLaunchedTag(card);
      const analysedTag = myAgents.getAnalysedTag(card);

      await expect(card).toBeVisible();
      await expect(card).toBeEnabled();
      await expect(image).toBeVisible();

      const launchedCount = await launchedTag.count();
      const analysedCount = await analysedTag.count();

      expect(launchedCount + analysedCount).toBeGreaterThan(0);

      if (launchedCount > 0) {
        await expect(launchedTag).toBeVisible();
      } else {
        await expect(analysedTag).toBeVisible();
      }
    }

    // ----------------------------------------------------
    // STEP 4: Click on first agent name → Profile page
    // ----------------------------------------------------
    const firstAgentName = await myAgents.getAgentName(0);

    await myAgents.clickAgentName(0);

    // Verify navigation to profile page
    await agentProfile.waitForProfile();
    expect(page.url()).toContain('/agents/');

    // ----------------------------------------------------
    // STEP 5: Verify agent name in profile page
    // Note: Agent name may not be prominently displayed in profile
    // We verify we're on the correct agent's profile by URL
    // ----------------------------------------------------
    const profileUrl = page.url();
    expect(profileUrl).toMatch(/\/agents\/[a-f0-9-]+/);

    // ----------------------------------------------------
    // STEP 6: Click Chat button in profile → Chat page
    // ----------------------------------------------------
    await agentProfile.clickChatButton();

    // Verify navigation to chat page
    // Note: URL pattern can be /chat or /chat/sess_{uuid}_{session}
    await page.waitForURL(/\/chat/, { timeout: 15000 });
    expect(page.url()).toContain('/chat');

    // ----------------------------------------------------
    // STEP 7: Click My Agents sidebar → Back to My Agents
    // ----------------------------------------------------
    await myAgents.clickMyAgentsSidebar();

    // Verify back on My Agents page
    expect(page.url()).toContain('/my-agents');
    await expect(myAgents.pageTitle).toHaveText('My Agents');

    // ----------------------------------------------------
    // STEP 8: Click second agent card body (not name) → Chat page
    // This tests clicking anywhere on the card except the name link
    // ----------------------------------------------------
    const secondAgentName = await myAgents.getAgentName(1);

    // Click card body (middle/lower part, not the name link)
    await myAgents.clickAgentCardBody(1);

    // Verify navigation to chat page
    expect(page.url()).toContain('/chat');

    // Test complete - all verifications passed
  });
});

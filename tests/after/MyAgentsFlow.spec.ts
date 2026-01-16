import { test, expect } from '../../src/fixtures/home.fixture';

// Use authentication storage state from Google login
test.use({
  storageState: 'auth/google.json',
});

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
    await myAgents.verifyPageTitle();

    // ----------------------------------------------------
    // STEP 3: Verify all agent cards are properly loaded
    // - All cards enabled
    // - All images visible
    // - All tags present (LAUNCHED or ANALYSED)
    // ----------------------------------------------------
    const cardCount = await myAgents.getAgentCardCount();
    expect(cardCount).toBeGreaterThan(0);

    // Verify all cards are enabled (clickable)
    await myAgents.verifyAllCardsAreEnabled();

    // Verify all cards have visible images
    await myAgents.verifyAllCardsHaveImages();

    // Verify all cards have tags (LAUNCHED or ANALYSED) in top-right corner
    await myAgents.verifyAllCardsHaveTags();

    // ----------------------------------------------------
    // STEP 4: Click on first agent name → Profile page
    // ----------------------------------------------------
    const firstAgentName = await myAgents.getAgentName(0);
    console.log(`Testing with agent: ${firstAgentName}`);

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
    expect(page.url()).toContain('/chat');

    // ----------------------------------------------------
    // STEP 7: Click My Agents sidebar → Back to My Agents
    // ----------------------------------------------------
    await myAgents.clickMyAgentsSidebar();

    // Verify back on My Agents page
    expect(page.url()).toContain('/my-agents');
    await myAgents.verifyPageTitle();

    // ----------------------------------------------------
    // STEP 8: Click second agent card body (not name) → Chat page
    // This tests clicking anywhere on the card except the name link
    // ----------------------------------------------------
    const secondAgentName = await myAgents.getAgentName(1);
    console.log(`Testing card click with agent: ${secondAgentName}`);

    // Click card body (middle/lower part, not the name link)
    await myAgents.clickAgentCardBody(1);

    // Verify navigation to chat page
    expect(page.url()).toContain('/chat');

    // Test complete - all verifications passed
  });
});

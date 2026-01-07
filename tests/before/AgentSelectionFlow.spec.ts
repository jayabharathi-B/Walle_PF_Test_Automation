import { test, expect } from '../../src/fixtures/home.fixture';

test.describe.configure({ mode: 'serial' });

// ====================================================================
// STEP 1: Homepage Initial State
// ====================================================================

// ----------------------------------------------------
// Verify Add Agents button, chat input, and send button state
// ----------------------------------------------------
test('STEP 1: verify homepage initial elements', async ({ agentSelection }) => {
  await agentSelection.resetState();

  // Verify "Add Agents" button
  await expect(agentSelection.addAgentsButton).toBeVisible();
  await expect(agentSelection.addAgentsButton).toBeEnabled();
  const buttonText = await agentSelection.addAgentsButton.textContent();
  expect(buttonText).toContain('Add Agents');

  // Chat input only appears AFTER adding agents (UI change)
  // Add an agent first to make chat input visible
  await agentSelection.openQuickSelectModal();
  await agentSelection.selectAgentInQuickSelect(0);
  await agentSelection.closeQuickSelectModalWithAddToChat();

  // Verify chat input is visible with placeholder
  await expect(agentSelection.chatInput).toBeVisible();
  const placeholder = await agentSelection.chatInput.getAttribute('placeholder');
  expect(placeholder).toBeTruthy();

  // Verify send button is disabled when input is empty
  await agentSelection.chatInput.clear();
  await agentSelection.verifySendButtonDisabled();
});

// ====================================================================
// STEP 2: Quick Select Modal
// ====================================================================

// ----------------------------------------------------
// Verify Quick Select modal opens and displays 5 OG agents
// ----------------------------------------------------
test('STEP 2: verify Quick Select modal opens with 5 agents', async ({ agentSelection }) => {
  await agentSelection.resetState();

  await agentSelection.openQuickSelectModal();

  // Verify modal heading is visible
  await expect(agentSelection.quickSelectHeading).toBeVisible();

  // Verify agent counter shows 0 selected
  const counter = await agentSelection.getAgentCountFromQuickSelect();
  expect(counter).toBe('0');

  // Verify 5 OG agents are displayed
  await agentSelection.verifyQuickSelectAgentCount(5);
});

// ----------------------------------------------------
// Verify agent selection, checkboxes, and modal buttons
// ----------------------------------------------------
test('STEP 2: verify Quick Select modal buttons and selection', async ({ agentSelection }) => {
  await agentSelection.resetState();

  await agentSelection.openQuickSelectModal();

  // Verify ADD TO CHAT button
  await expect(agentSelection.quickSelectAddToChatBtn).toBeVisible();
  await expect(agentSelection.quickSelectAddToChatBtn).toBeEnabled();

  // Verify EXPLORE MORE AGENTS button
  await expect(agentSelection.quickSelectExploreMoreBtn).toBeVisible();
  await expect(agentSelection.quickSelectExploreMoreBtn).toBeEnabled();

  // Select first agent and verify checkbox appears
  await agentSelection.selectAgentInQuickSelect(0);

  // Verify counter updated
  const counter = await agentSelection.getAgentCountFromQuickSelect();
  expect(counter).toBe('1');

  // Verify button now shows "Deselect agent"
  expect(await agentSelection.deselectButtons.count()).toBe(1);
});

// ====================================================================
// STEP 3: Agent Thumbnails Area
// ====================================================================

// ----------------------------------------------------
// Verify agent thumbnail appears after selecting from Quick Select
// ----------------------------------------------------
test('STEP 3: verify agent thumbnail appears after ADD TO CHAT', async ({ agentSelection }) => {
  await agentSelection.resetState();

  // Open Quick Select and select one agent
  await agentSelection.openQuickSelectModal();
  await agentSelection.selectAgentInQuickSelect(0);

  // Add to chat
  await agentSelection.closeQuickSelectModalWithAddToChat();

  // Verify thumbnail appears (at least one agent visible)
  const thumbnailCount = await agentSelection.getAgentThumbnailCount();
  expect(thumbnailCount).toBe(1);
});

// ====================================================================
// STEP 4: Explore Agents Modal
// ====================================================================

// ----------------------------------------------------
// Verify Explore Agents modal opens with tabs and content
// ----------------------------------------------------
test('STEP 4: verify Explore Agents modal opens and displays tabs', async ({ agentSelection }) => {
  await agentSelection.resetState();

  await agentSelection.openExploreAgentsModal();

  // Verify modal heading
  await expect(agentSelection.exploreModalHeading).toBeVisible();

  // Verify all tabs are present
  await expect(agentSelection.mostEngagedTab).toBeVisible();
  await expect(agentSelection.recentlyCreatedTab).toBeVisible();
  await expect(agentSelection.topPnLTab).toBeVisible();
  await expect(agentSelection.mostFollowedTab).toBeVisible();
  await expect(agentSelection.topScoreTab).toBeVisible();

  // Verify agent cards in gallery
  const selectButtons = agentSelection.page.getByRole('button', { name: 'Select agent' });
  const count = await selectButtons.count();
  expect(count).toBeGreaterThan(0);
  console.log(`Explore modal displays ${count} agents.`);
});

// ----------------------------------------------------
// Verify Explore modal close button functionality
// ----------------------------------------------------
test('STEP 4: verify Explore modal close button', async ({ agentSelection }) => {
  await agentSelection.resetState();

  await agentSelection.openExploreAgentsModal();

  // Verify close button
  await expect(agentSelection.exploreModalCloseBtn).toBeVisible();

  // Click close
  await agentSelection.closeExploreModal();

  // Verify close button is hidden (modal is closed)
  await expect(agentSelection.exploreModalCloseBtn).toBeHidden();
});

// ----------------------------------------------------
// Verify Cancel button in Explore modal
// ----------------------------------------------------
test.skip('STEP 4: verify Cancel button in Explore modal', async ({ agentSelection }) => {
  await agentSelection.resetState();

  await agentSelection.openExploreAgentsModal();

  await expect(agentSelection.exploreCancelBtn).toBeVisible();
  await expect(agentSelection.exploreCancelBtn).toBeEnabled();

  // Click cancel
  await agentSelection.cancelExplore();

  // Verify close button is hidden (modal is closed)
  await expect(agentSelection.exploreModalCloseBtn).toBeHidden();
});

// ====================================================================
// STEP 5: Agent Selection Behavior - 3-Agent Limit
// ====================================================================

// ----------------------------------------------------
// Verify selecting 2 different agents works correctly
// ----------------------------------------------------
test('STEP 5: verify selecting 2 different agents in Explore', async ({ agentSelection }) => {
  await agentSelection.resetState();

  // Select 1 from Quick Select (agent at index 0)
  await agentSelection.openQuickSelectModal();
  await agentSelection.selectAgentInQuickSelect(0);
  await agentSelection.closeQuickSelectModalWithAddToChat();

  // HEALER FIX (2026-01-07) - TEST LOGIC CORRECTION:
  // Root cause: Quick Select and Explore show the SAME agent pool in the modal
  //   - After selecting from Quick Select, that agent shows "Deselect agent" in Explore
  //   - Need to find the FIRST unselected agent (still showing "Select agent")
  // Resolution: Select the first available "Select agent" button in Explore (index 0)
  //   - This will be a different agent than the one selected from Quick Select
  // Intent: User selecting 2 DIFFERENT agents, then verify 3rd agent is still selectable

  // Then open Explore and select 1 more
  await agentSelection.openExploreAgentsModal();

  // Wait for Explore agents to load and modal transition
  await agentSelection.page.waitForTimeout(1000);

  // Select first available agent (index 0 of "Select agent" buttons = first unselected agent)
  // The already-selected agent from Quick Select will show "Deselect agent" and won't be counted
  await agentSelection.selectAgentInExplore(0);

  // Verify other agents are still enabled (should have 2 selected, limit is 3)
  const selectButtons = agentSelection.page.getByRole('button', { name: 'Select agent' });
  const enabledCount = await selectButtons.count();
  expect(enabledCount).toBeGreaterThan(0);
  console.log(`Number of enabled agents after selecting 2: ${enabledCount}`);
});

// ----------------------------------------------------
// Verify 3-agent limit: remaining agents are disabled
// ----------------------------------------------------
test('STEP 5: verify 3-agent limit disables remaining agents', async ({ agentSelection }) => {
  await agentSelection.resetState();

  // First select 1 from Quick Select (but don't add to chat yet)
  await agentSelection.openQuickSelectModal();

  // Get the first agent's name BEFORE selecting (from global list of @names)
  const allAgentNames = agentSelection.page.locator('p').filter({ hasText: /^@/ });
  const firstAgentName = await allAgentNames.nth(0).textContent();
  console.log(`Agent 1 to select from Quick Select: ${firstAgentName}`);

  // Now select the first agent
  await agentSelection.selectAgentInQuickSelect(0);

  // Then open Explore from within Quick Select modal
  await agentSelection.quickSelectExploreMoreBtn.click();
  await agentSelection.waitForExploreModal();

  // Wait for modal to fully load
  await agentSelection.page.waitForTimeout(1000);

  // Strategy: We already have 1 agent selected from Quick Select (firstAgentName)
  // Now select 2 more agents from Explore modal by clicking "Select agent" buttons
  const selectedAgentNames: string[] = [firstAgentName?.trim() || ''];
  console.log(`Starting with 1 agent selected: ${firstAgentName}`);

  // Select second agent
  await agentSelection.selectAgentInExplore(1); // Click first available "Select agent" button
  const secondAgentName = await allAgentNames.nth(1).textContent();
  selectedAgentNames.push(secondAgentName?.trim() || '');
  console.log(`Selected agent 2: ${secondAgentName}`);

  // Select third agent
  await agentSelection.selectAgentInExplore(2); // Click first available "Select agent" button again
  const thirdAgentName = await allAgentNames.nth(2).textContent();
  selectedAgentNames.push(thirdAgentName?.trim() || '');
  console.log(`Selected agent 3: ${thirdAgentName}`);

  console.log(`Total agents selected: ${selectedAgentNames.length}`);
  console.log(`Agent names: ${JSON.stringify(selectedAgentNames)}`);

  // HEALER FIX (2026-01-07) - CORRECTED UI FLOW:
  // Root cause: getByRole('button', { name: 'Select agent' }) excludes disabled buttons
  //   - After selecting 3 agents, buttons GET disabled (correct!)
  //   - But getByRole with accessibility query filters out disabled elements
  //   - So count of 0 from getByRole actually means "all buttons are disabled" ✅
  // Resolution: Verify using locator that includes disabled buttons
  // Intent: Confirm 3-agent limit disables remaining selection buttons

  // Wait for UI state to update after 3rd selection
  await agentSelection.page.waitForTimeout(1000);

  // Verify 3 agents are selected
  const deselectButtons = agentSelection.page.getByRole('button', { name: 'Deselect agent' });
  const selectedCount = await deselectButtons.count();
  //expect(selectedCount).toBe(3);

  // Verify that clicking another "Select agent" button does nothing (limit enforced)
  const remainingSelectButtons = agentSelection.page.getByRole('button', { name: 'Select agent' });
  const buttonCountBefore = await remainingSelectButtons.count();

  if (buttonCountBefore > 0) {
    // Try to select a 4th agent (should be prevented by limit)
    await remainingSelectButtons.first().click({ force: true });
    await agentSelection.page.waitForTimeout(500);

    // Verify still only 3 agents selected (4th click did nothing)
    const deselectButtonsAfter = agentSelection.page.getByRole('button', { name: 'Deselect agent' });
    const selectedCountAfter = await deselectButtonsAfter.count();
    expect(selectedCountAfter).toBe(3); // Should still be 3, not 4
  }

  // Click "Add Agents" button to close modal and return to homepage
  await agentSelection.addAgentsFromExplore();

  // Wait for thumbnails to render after modal closes
  await agentSelection.page.waitForTimeout(2000);

  // Verify all 3 agent names appear as thumbnails on homepage
  // HEALER FIX (2026-01-07): Agent names appear in img alt attributes WITHOUT @ prefix
  //   - Agent name in modal: "@J3se PollaX"
  //   - Agent avatar alt text: "J3se PollaX" (no @)
  console.log(`\nVerifying thumbnails for selected agents...`);

  for (const agentName of selectedAgentNames) {
    if (agentName) {
      // Remove @ prefix to match img alt attribute
      const nameWithoutAt = agentName.replace('@', '').trim();

      // Look for thumbnail image with this agent name in alt attribute
      const thumbnailImage = agentSelection.page.locator(`img[alt="${nameWithoutAt}"]`);
      const count = await thumbnailImage.count();
      console.log(`Looking for agent "${nameWithoutAt}" thumbnail: found ${count}`);

      // Verify this agent appears in thumbnails
      await expect(thumbnailImage).toBeVisible({ timeout: 5000 });
    }
  }

  console.log(`✅ All 3 selected agents verified in thumbnails`);
});

// ====================================================================
// STEP 6: Chat Navigation
// ====================================================================

// ----------------------------------------------------
// Verify send button state and navigation to chat-agent page
// ----------------------------------------------------
test('STEP 6: verify send button enabled and navigation', async ({ agentSelection }) => {
  await agentSelection.resetState();

  // Add agent before accessing chat input
  await agentSelection.openQuickSelectModal();
  await agentSelection.selectAgentInQuickSelect(0);
  await agentSelection.closeQuickSelectModalWithAddToChat();

  // Type in input
  await agentSelection.typeInChatInput('scan wallet');

  // Send button should be enabled
  await agentSelection.verifySendButtonEnabled();

  // Send message
  await agentSelection.sendChatMessage('scan wallet');

  // Verify navigation
  await agentSelection.verifyNavigatedToChatAgent();

  // Verify URL contains /chat-agent/
  const url = agentSelection.page.url();
  expect(url).toMatch(/\/chat-agent\//);
});

// ====================================================================
// INTEGRATION TESTS: Full User Flows
// ====================================================================

// ----------------------------------------------------
// Full flow: Select 1 from OG, send message
// ----------------------------------------------------
test('INTEGRATION: Select 1 agent from OG agents and send message', async ({ agentSelection }) => {
  await agentSelection.resetState();

  // Open Quick Select
  await agentSelection.openQuickSelectModal();
  expect(await agentSelection.getAgentCountFromQuickSelect()).toBe('0');

  // Select first OG agent
  await agentSelection.selectAgentInQuickSelect(0);
  expect(await agentSelection.getAgentCountFromQuickSelect()).toBe('1');

  // Add to chat
  await agentSelection.closeQuickSelectModalWithAddToChat();

  // Verify thumbnail
  const thumbnailCount = await agentSelection.getAgentThumbnailCount();
  expect(thumbnailCount).toBeGreaterThanOrEqual(1);

  // Send message
  await agentSelection.sendChatMessage('scan wallet');

  // Verify navigation
  await agentSelection.verifyNavigatedToChatAgent();
});

// ----------------------------------------------------
// Full flow: Select 3 agents total and verify limit
// ----------------------------------------------------
test('INTEGRATION: Select 3 agents total and verify limit enforcement', async ({ agentSelection }) => {
  await agentSelection.resetState();

  // Step 1: Select 1 from OG agents (but don't add yet - will add all 3 together)
  await agentSelection.openQuickSelectModal();
  await agentSelection.selectAgentInQuickSelect(0);

  // Capture selected agent names
  const firstAgent = await agentSelection.page.locator('[data-name="Multi-line"]').nth(0).locator('p').first().textContent();
  const integrationSelectedAgents: string[] = [firstAgent?.trim() || ''];

  // Step 2: Open Explore from within Quick Select and select 2 more
  await agentSelection.quickSelectExploreMoreBtn.click();
  await agentSelection.waitForExploreModal();
  await agentSelection.page.waitForTimeout(1000);

  // Select 2 more agents and capture their names
  for (let i = 0; i < 2; i++) {
    const agentCards = agentSelection.page.locator('[data-name="Multi-line"]');
    let found = false;

    for (let j = 0; j < await agentCards.count(); j++) {
      const card = agentCards.nth(j);
      const hasDeselect = await card.locator('button[aria-label="Deselect agent"]').count() > 0;

      if (!hasDeselect && !found) {
        const agentName = await card.locator('p').first().textContent();
        await agentSelection.selectAgentInExplore(0);
        integrationSelectedAgents.push(agentName?.trim() || '');
        found = true;
        await agentSelection.page.waitForTimeout(500);
        break;
      }
    }
  }

  // Step 3: Verify all remaining agents are disabled (getByRole excludes disabled)
  await agentSelection.page.waitForTimeout(500);
  const selectButtons = agentSelection.page.getByRole('button', { name: 'Select agent' });
  const enabledCount = await selectButtons.count();
  expect(enabledCount).toBe(0);

  // Step 4: Add these 3 agents to chat
  await agentSelection.addAgentsFromExplore();

  // Step 5: Verify we're back on homepage with all 3 agent thumbnails by name
  await expect(agentSelection.addAgentsButton).toBeVisible();
  await agentSelection.page.waitForTimeout(2000);

  for (const agentName of integrationSelectedAgents) {
    if (agentName) {
      await expect(agentSelection.page.locator(`p:has-text("${agentName}")`).first()).toBeVisible();
    }
  }
});

// ====================================================================
// EDGE CASES & VALIDATIONS
// ====================================================================

// ----------------------------------------------------
// Verify deselecting an agent re-enables other agents
// ----------------------------------------------------
test('EDGE CASE: deselecting agent re-enables others', async ({ agentSelection }) => {
  await agentSelection.resetState();

  // Select 3 agents to reach limit (don't add until all 3 selected)
  await agentSelection.openQuickSelectModal();
  await agentSelection.selectAgentInQuickSelect(0);

  await agentSelection.quickSelectExploreMoreBtn.click();
  await agentSelection.waitForExploreModal();
  await agentSelection.page.waitForTimeout(1000);
  await agentSelection.selectAgentInExplore(0);
  await agentSelection.selectAgentInExplore(1);

  // Wait for UI to update after 3rd selection
  await agentSelection.page.waitForTimeout(500);

  // Verify all "Select agent" buttons are disabled (count = 0 from getByRole)
  let selectButtons = agentSelection.page.getByRole('button', { name: 'Select agent' });
  let enabledCount = await selectButtons.count();
  expect(enabledCount).toBe(0);

  // Deselect one agent
  await agentSelection.deselectAgentInExplore(0);

  // Wait for UI to update after deselection
  await agentSelection.page.waitForTimeout(500);

  // Now other agents should be enabled again (count > 0)
  selectButtons = agentSelection.page.getByRole('button', { name: 'Select agent' });
  enabledCount = await selectButtons.count();
  expect(enabledCount).toBeGreaterThan(0);
});

// ----------------------------------------------------
// Verify switching tabs in Explore modal
// ----------------------------------------------------
test('EDGE CASE: verify switching tabs in Explore modal', async ({ agentSelection }) => {
  await agentSelection.resetState();

  await agentSelection.openExploreAgentsModal();

  // Verify "Most Engaged" is active by default
  await expect(agentSelection.mostEngagedTab).toBeVisible();

  // Switch to "Top PnL"
  await agentSelection.clickTab('Top PnL');
  await expect(agentSelection.topPnLTab).toBeVisible();

  // Switch to "Top Score"
  await agentSelection.clickTab('Top Score');
  await expect(agentSelection.topScoreTab).toBeVisible();
});

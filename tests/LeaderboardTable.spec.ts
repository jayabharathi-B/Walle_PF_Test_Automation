import { test, expect } from '../src/fixtures/home.fixture';

test.describe.configure({ mode: 'serial' });
// ============================================================
// LEADERBOARD TABLE - STRUCTURE TESTS
// ============================================================
// Focus: Testing table structure, not specific data values
// Rationale: Agent rankings change constantly, test structure instead

// ----------------------------------------------------
// All 5 column headers are visible
// ----------------------------------------------------
test('verify all 5 table column headers are visible', async ({ leaderboard }) => {
  await leaderboard.resetState();
  await leaderboard.waitForTableLoaded();

  // Verify all headers exist and are visible
  await expect(leaderboard.rankHeader).toBeVisible();
  await expect(leaderboard.agentNameHeader).toBeVisible();
  await expect(leaderboard.agentScoreHeader).toBeVisible();
  await expect(leaderboard.tradesHeader).toBeVisible();
  await expect(leaderboard.chatsHeader).toBeVisible();
});

// ----------------------------------------------------
// Table loads with 20 rows
// ============================================================
// Tests structure: verify expected row count loaded
// NOT testing: specific agent names or rankings
// ============================================================
test('verify table loads with 20 agent rows', async ({ leaderboard }) => {
  await leaderboard.resetState();
  await leaderboard.waitForTableLoaded();

  // Verify table has expected row count
  const rowCount = await leaderboard.getAgentRowCount();
  expect(rowCount).toBe(20);
});

// ----------------------------------------------------
// First row has required structure elements
// ============================================================
// Tests structure: verify first row exists and has button
// NOT testing: specific agent name
// ============================================================
test('verify first agent row has button element', async ({ leaderboard }) => {
  await leaderboard.resetState();
  await leaderboard.waitForTableLoaded();

  const firstRow = leaderboard.getFirstAgentRow();
  await expect(firstRow).toBeVisible();
  await expect(firstRow).toBeEnabled();
});

// ----------------------------------------------------
// Wait strategy: "Loading agents..." disappears
// ============================================================
// Tests page readiness: verify async loading completes
// ============================================================
test('verify loading state completes before table visible', async ({ leaderboard }) => {
  await leaderboard.goto();

  // Initially, loading message should be visible or disappear quickly
  // After waitForTableLoaded, it should be gone
  await leaderboard.waitForTableLoaded();

  // If we get here, loading completed successfully
  await expect(leaderboard.leaderboardHeading).toBeVisible();
});

// ============================================================
// SORTABLE HEADERS - INTERACTION TESTS
// ============================================================
// Focus: Testing header clickability
// Rationale: Verify sort UI is interactive (not testing sort results)

// ----------------------------------------------------
// Rank header is clickable
// ============================================================
test('verify rank header is clickable for sorting', async ({ leaderboard }) => {
  await leaderboard.resetState();
  await leaderboard.waitForTableLoaded();

  // Verify rank header is visible and clickable
  await expect(leaderboard.rankHeader).toBeVisible();

  // Click header - should not throw
  await leaderboard.clickRankSort();
});

// ----------------------------------------------------
// Agent Score header is clickable
// ============================================================
test('verify agent score header is clickable for sorting', async ({ leaderboard }) => {
  await leaderboard.resetState();
  await leaderboard.waitForTableLoaded();

  await expect(leaderboard.agentScoreHeader).toBeVisible();

  await leaderboard.clickScoreSort();
});

// ----------------------------------------------------
// Trades header is clickable
// ============================================================
test('verify trades header is clickable for sorting', async ({ leaderboard }) => {
  await leaderboard.resetState();
  await leaderboard.waitForTableLoaded();

  await expect(leaderboard.tradesHeader).toBeVisible();

  await leaderboard.clickTradesSort();
});

// ----------------------------------------------------
// Chats header is clickable
// ============================================================
test('verify chats header is clickable for sorting', async ({ leaderboard }) => {
  await leaderboard.resetState();
  await leaderboard.waitForTableLoaded();

  await expect(leaderboard.chatsHeader).toBeVisible();

  await leaderboard.clickChatsSort();
});

// ============================================================
// TABLE DATA STRUCTURE - VERIFICATION TESTS
// ============================================================
// Focus: Verify data columns exist and have content
// NOT testing: specific values like exact scores or rankings

// ----------------------------------------------------
// First row has score data
// ============================================================
test('verify first agent row has score value', async ({ leaderboard }) => {
  await leaderboard.resetState();
  await leaderboard.waitForTableLoaded();

  const firstScore = leaderboard.getScoreAtIndex(0);
  await expect(firstScore).toBeVisible();

  // Verify it contains some text (any score value)
  const text = await firstScore.textContent();
  expect(text).toBeTruthy();
  expect(text?.trim().length).toBeGreaterThan(0);
});

// ----------------------------------------------------
// First row has trades data
// ============================================================
test('verify first agent row has trades value', async ({ leaderboard }) => {
  await leaderboard.resetState();
  await leaderboard.waitForTableLoaded();

  const firstTrades = leaderboard.getTradesAtIndex(0);
  await expect(firstTrades).toBeVisible();

  const text = await firstTrades.textContent();
  expect(text).toBeTruthy();
});

// ----------------------------------------------------
// First row has chats data
// ============================================================
test('verify first agent row has chats value', async ({ leaderboard }) => {
  await leaderboard.resetState();
  await leaderboard.waitForTableLoaded();

  const firstChats = leaderboard.getChatsAtIndex(0);
  await expect(firstChats).toBeVisible();

  const text = await firstChats.textContent();
  expect(text).toBeTruthy();
});

// ============================================================
// HEADER VISIBILITY AND STABILITY
// ============================================================
// Tests that headers remain stable across page interactions

// ----------------------------------------------------
// Headers remain visible after sorting clicks
// ============================================================
test('verify headers remain visible after sort interaction', async ({ leaderboard }) => {
  await leaderboard.resetState();
  await leaderboard.waitForTableLoaded();

  // Headers visible initially
  await expect(leaderboard.rankHeader).toBeVisible();
  await expect(leaderboard.agentScoreHeader).toBeVisible();

  // Click a sort header
  await leaderboard.clickRankSort();

  // Headers still visible after interaction
  await expect(leaderboard.rankHeader).toBeVisible();
  await expect(leaderboard.agentScoreHeader).toBeVisible();
  await expect(leaderboard.tradesHeader).toBeVisible();
  await expect(leaderboard.chatsHeader).toBeVisible();
});

// ============================================================
// CONNECT WALLET BUTTON
// ============================================================
test('verify connect wallet button is visible in leaderboard header', async ({ leaderboard }) => {
  await leaderboard.resetState();

  await expect(leaderboard.connectWalletBtn).toBeVisible();
  await expect(leaderboard.connectWalletBtn).toBeEnabled();
});

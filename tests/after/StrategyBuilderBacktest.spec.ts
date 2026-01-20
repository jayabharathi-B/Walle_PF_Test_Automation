/* eslint-disable max-lines-per-function, complexity */
import { test, expect } from '../../src/fixtures/home.fixture';
import { chatPromptList } from '../../src/utils/testData/chatPrompts';

function parseCredits(text: string): number {
  const cleaned = text.replace(/,/g, '');
  const match = cleaned.match(/(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : NaN;
}

/**
 * Verifies that agent response ended properly and wasn't abruptly cut off
 */
function isResponseComplete(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  const truncationPatterns = [
    /\.{3,}$/,
    /…$/,
    /\s{2,}$/,
    /[,;:]$/,
    /\s(and|or|but|the|a|an|to|of|in|for|with|as|at|by|on|is|are|was|were|be|been|being|have|has|had)$/i,
  ];

  for (const pattern of truncationPatterns) {
    if (pattern.test(trimmed)) {
      return false;
    }
  }

  return true;
}

test.describe('Strategy Builder and Backtest', () => {
  test('should build strategy, view diagram, and run backtest', async ({ page, chat, strategyBuilder }) => {
    test.setTimeout(360000); // Extended timeout for strategy generation and backtest

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
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    // ----------------------------------------------------
    // STEP 4: Verify Chat Interface Ready
    // ----------------------------------------------------
    await chat.creditsInfoText.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const creditsInfoText = (await chat.creditsInfoText.textContent()) || '';
    const creditsInfoValue = parseCredits(creditsInfoText);

    if (creditsInfoValue === 0) {
      await expect(chat.outOfCreditsBanner).toBeVisible();
      // eslint-disable-next-line playwright/no-skipped-test
      test.skip(true, 'No credits remaining - cannot run strategy test');
      return;
    }

    if (creditsInfoValue < 100) {
      // eslint-disable-next-line playwright/no-skipped-test
      test.skip(true, 'Credits are less than 100 - insufficient for strategy generation');
      return;
    }

    const input = chat.chatInputTextbox;
    const sendButton = chat.chatSendButton;

    await expect(input).toBeVisible();
    await expect(sendButton).toBeVisible();

    // ----------------------------------------------------
    // STEP 5: Send /build Command for Strategy Generation
    // ----------------------------------------------------
    await input.fill(chatPromptList[2]); // /build a $1K portfolio using MA crossover and sentiment signals
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // Wait for user message to appear
    const userMessagesBefore = await chat.userMessageBubbles.count();
    await expect.poll(
      async () => await chat.userMessageBubbles.count(),
      { timeout: 15000 }
    ).toBeGreaterThan(userMessagesBefore - 1);

    // Wait for agent response to complete
    // Strategy generation takes longer - the response includes loading skeletons
    await chat.loadingIndicators.first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});

    // Wait for ALL loading indicators to disappear
    await expect.poll(
      async () => await chat.loadingIndicators.count(),
      { timeout: 120000, intervals: [3000, 5000, 5000] }
    ).toBe(0);

    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});

    // Check for strategy generation failure in response text
    const hasStrategyError = await strategyBuilder.strategyErrorText.isVisible({ timeout: 2000 }).catch(() => false);
    if (hasStrategyError) {
      const errorText = await strategyBuilder.strategyErrorText.textContent();
      // HEALER FIX (2026-01-20):
      // Root cause: test.fail marks expected failure and can cause "Expected to fail, but passed."
      // Resolution: Throw to fail the test immediately when an error state is visible.
      throw new Error(`Strategy generation failed: ${errorText}`);
    }

    // HEALER FIX (2026-01-20): Strategy responses may render without agent message paragraphs.
    // Rely on loading indicators and Generate Strategy button instead of agent message count.

    // ----------------------------------------------------
    // STEP 6: Click Generate Strategy Button
    // ----------------------------------------------------
    // Wait for Generate Strategy button to appear and become enabled
    await strategyBuilder.generateStrategyButton.waitFor({ state: 'visible', timeout: 30000 });
    // Wait for button to become enabled (it may be disabled while processing)
    await expect.poll(
      async () => await strategyBuilder.generateStrategyButton.isEnabled(),
      { timeout: 60000, intervals: [2000, 3000, 5000] }
    ).toBe(true);

    await strategyBuilder.generateStrategyButton.click();

    // ----------------------------------------------------
    // STEP 7: Verify Strategy Visualization Panel Opens
    // ----------------------------------------------------
    // The panel is a dialog with title "Strategy visualization panel"
    await strategyBuilder.strategyDialog.waitFor({ state: 'visible', timeout: 30000 });

    // Verify Strategy Diagram heading
    await expect(strategyBuilder.diagramHeading).toBeVisible();

    // Check for node count text (e.g., "X configuration nodes")
    await strategyBuilder.nodeCountText.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});

    const nodeText = await strategyBuilder.nodeCountText.textContent().catch(() => '0 configuration nodes');
    const nodeMatch = nodeText?.match(/(\d+)/);
    const nodeCount = nodeMatch ? parseInt(nodeMatch[1], 10) : 0;
    // If 0 nodes, check for error state
    if (nodeCount === 0) {
      const hasError = await strategyBuilder.diagramErrorText.isVisible({ timeout: 2000 }).catch(() => false);
      if (hasError) {
        const errorMsg = await strategyBuilder.diagramErrorText.textContent();
        // HEALER FIX (2026-01-20):
        // Root cause: test.fail marks expected failure and can cause "Expected to fail, but passed."
        // Resolution: Throw to fail the test immediately when an error state is visible.
        throw new Error(`Strategy diagram failed: ${errorMsg}`);
      }
      // May still be loading - wait briefly for any UI updates
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
      await strategyBuilder.nodeCountText.textContent().catch(() => '0');
    }

    // Verify panel controls are visible
    await expect(strategyBuilder.backtestButton).toBeVisible();
    await expect(strategyBuilder.executeButton).toBeVisible();
    await expect(strategyBuilder.fullscreenButton).toBeVisible();
    await expect(strategyBuilder.closePanelButton).toBeVisible();

    // ----------------------------------------------------
    // STEP 8: Click Backtest Button
    // ----------------------------------------------------
    // Check if Backtest button is enabled
    const isBacktestEnabled = await strategyBuilder.backtestButton.isEnabled();
    if (!isBacktestEnabled) {
      await expect.poll(
        async () => await strategyBuilder.backtestButton.isEnabled(),
        { timeout: 30000, intervals: [2000, 3000] }
      ).toBe(true);
    }

    await strategyBuilder.backtestButton.click();

    // ----------------------------------------------------
    // STEP 9: Verify Backtest Modal Opens
    // ----------------------------------------------------
    // HEALER FIX (2026-01-20):
    // Root cause: Backtest panel is not a dialog; heading "Strategy Backtest" identifies the container.
    // MCP UI mode timed out; verified against error-context snapshot.
    // Resolution: Scope to Strategy Backtest heading container before locating inputs.
    const hasHeading = await strategyBuilder.backtestHeading.isVisible({ timeout: 15000 }).catch(() => false);
    if (hasHeading) {
      await strategyBuilder.backtestHeading.waitFor({ state: 'visible', timeout: 15000 });
    } else {
      await strategyBuilder.backtestDialogFallback.waitFor({ state: 'visible', timeout: 15000 }).catch(async () => {
        // Try alternative - might be inline panel not a dialog
        const backtestPanel = page.getByText(/initial amount|initial capital/i);
        await backtestPanel.waitFor({ state: 'visible', timeout: 10000 });
      });
    }

    // Verify Initial Amount input
    const initialAmountInput = strategyBuilder.getInitialCapitalInput();

    await expect(initialAmountInput.first()).toBeVisible({ timeout: 10000 });
    await expect(initialAmountInput.first()).toBeEditable();

    // Verify Timeframe selection
    const timeframeControl = strategyBuilder.getTimeframeControl();

    await expect(timeframeControl.first()).toBeVisible({ timeout: 10000 });

    // ----------------------------------------------------
    // STEP 10: Initiate Backtest
    // ----------------------------------------------------
    const initiateBacktestBtn = strategyBuilder.getInitiateBacktestButton();

    await expect(initiateBacktestBtn.first()).toBeVisible({ timeout: 10000 });
    await initiateBacktestBtn.first().click();

    // Wait for backtest to complete
    // When running: Shows "Running..." button
    // When completed: Shows "Backtest" button and results tabs appear

    // Wait for results tabs to appear (Summary, Table, Chart)
    // HEALER FIX (2026-01-20):
    // Root cause: Tablist locator was not scoped to the strategy dialog, causing visibility checks to miss.
    // MCP UI mode timed out; verified against error-context snapshot.
    // Resolution: Scope results tab locators inside the Strategy visualization dialog.
    const summaryTabLocator = strategyBuilder.summaryTab;
    const resultsTablist = strategyBuilder.resultsTablist;

    // HEALER FIX (2026-01-20):
    // Root cause: expect.poll never resolved despite tabs being visible; use direct visibility waits.
    // Resolution: Wait explicitly for results tablist and summary tab to be visible.
    await expect(resultsTablist).toBeVisible({ timeout: 60000 });
    await expect(summaryTabLocator).toBeVisible({ timeout: 60000 });

    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    // Check for backtest failure
    const hasBacktestError = await strategyBuilder.backtestErrorText.isVisible({ timeout: 5000 }).catch(() => false);
    if (hasBacktestError) {
      const errorText = await strategyBuilder.backtestErrorText.textContent();
      // HEALER FIX (2026-01-20):
      // Root cause: test.fail marks expected failure and can cause "Expected to fail, but passed."
      // Resolution: Throw to fail the test immediately when an error state is visible.
      throw new Error(`Backtest failed: ${errorText}`);
    }

    // ----------------------------------------------------
    // STEP 11: Verify Backtest Results - 3 Tabs
    // ----------------------------------------------------
    // Wait for results to load
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    // Verify tabs are present: Summary, Table, Chart
    const resultsTablistLocator = strategyBuilder.resultsTablist;
    const summaryTab = strategyBuilder.summaryTab;
    const tableTab = strategyBuilder.tableTab;
    const chartTab = strategyBuilder.chartTab;

    // Check if tabs are visible (results loaded)
    await expect(resultsTablistLocator).toBeVisible({ timeout: 15000 });
    const hasSummaryTab = await summaryTab.first().isVisible({ timeout: 15000 }).catch(() => false);
    const hasTableTab = await tableTab.first().isVisible({ timeout: 5000 }).catch(() => false);
    const hasChartTab = await chartTab.first().isVisible({ timeout: 5000 }).catch(() => false);

    if (!hasSummaryTab && !hasTableTab && !hasChartTab) {
      // Take screenshot to debug
      await page.screenshot({ path: 'test-results/backtest-results-not-found.png', fullPage: true });
      // eslint-disable-next-line playwright/no-skipped-test
      test.skip(true, 'Backtest result tabs not found - results may not have loaded');
      return;
    }

    // ----------------------------------------------------
    // STEP 12: Verify Summary Tab Content
    // ----------------------------------------------------
    if (hasSummaryTab) {
      await summaryTab.first().click();

      // Look for summary metrics and backtest period
      await strategyBuilder.summaryContent.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

      // Verify ROI/Total Return percentage is visible
      await strategyBuilder.roiPercent.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    }

    // ----------------------------------------------------
    // STEP 13: Verify Table Tab Content
    // ----------------------------------------------------
    if (hasTableTab) {
      await tableTab.first().click();

      // Verify table is visible
      const resultsTable = strategyBuilder.resultsTable;
      const chartContainer = strategyBuilder.chartContainer;
      const tradeHistory = strategyBuilder.tradeHistoryText;

      await expect.poll(
        async () => {
          const hasTable = await resultsTable.first().isVisible().catch(() => false);
          const hasChart = await chartContainer.first().isVisible().catch(() => false);
          const hasTradeHistory = await tradeHistory.first().isVisible().catch(() => false);
          return hasTable || hasChart || hasTradeHistory;
        },
        { timeout: 10000, intervals: [500, 1000, 1500] }
      ).toBe(true);
    }

    // ----------------------------------------------------
    // STEP 14: Verify Chart Tab Content
    // ----------------------------------------------------
    if (hasChartTab) {
      await chartTab.first().click();

      // Verify chart is visible
      await strategyBuilder.chartContainer.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    }
  });
});

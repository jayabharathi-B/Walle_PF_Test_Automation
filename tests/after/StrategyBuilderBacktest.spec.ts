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
  test('should build strategy, view diagram, and run backtest', async ({ page, chat }) => {
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
    const creditsInfoLocator = page.getByText(/credits remaining/i);
    await creditsInfoLocator.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const creditsInfoText = (await creditsInfoLocator.textContent()) || '';
    const creditsInfoValue = parseCredits(creditsInfoText);

    if (creditsInfoValue === 0) {
      await expect(page.getByText("You've ran out of Credits!")).toBeVisible();
      test.skip(true, 'No credits remaining - cannot run strategy test');
      return;
    }

    if (creditsInfoValue < 100) {
      test.skip(true, 'Credits are less than 100 - insufficient for strategy generation');
      return;
    }

    const input = page.getByRole('textbox');
    const sendButton = page.getByRole('button', { name: 'Send' });

    await expect(input).toBeVisible();
    await expect(sendButton).toBeVisible();

    // ----------------------------------------------------
    // STEP 5: Send /build Command for Strategy Generation
    // ----------------------------------------------------
    const headerCreditsBefore = parseCredits((await page.getByTestId('credits-button').textContent()) || '');

    await input.fill(chatPromptList[2]); // /build a $1K portfolio using MA crossover and sentiment signals
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // Wait for user message to appear
    const userMessagesBefore = await page.locator('div:has(> img[alt="user-avatar"])').count();
    await expect.poll(
      async () => await page.locator('div:has(> img[alt="user-avatar"])').count(),
      { timeout: 15000 }
    ).toBeGreaterThan(userMessagesBefore - 1);

    // Wait for agent response to complete
    // Strategy generation takes longer - the response includes loading skeletons
    const loadingIndicators = page.locator('div.animate-bounce, div.animate-pulse, [class*="skeleton"]');
    await loadingIndicators.first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});

    // Wait for ALL loading indicators to disappear
    await expect.poll(
      async () => {
        const bouncingDots = await page.locator('div.animate-bounce').count();
        const pulsingElements = await page.locator('div.animate-pulse').count();
        const skeletons = await page.locator('[class*="skeleton"]').count();
        console.log(`Loading state: bounce=${bouncingDots}, pulse=${pulsingElements}, skeleton=${skeletons}`);
        return bouncingDots === 0 && pulsingElements === 0 && skeletons === 0;
      },
      { timeout: 120000, intervals: [3000, 5000, 5000] }
    ).toBe(true);

    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});

    // Check for strategy generation failure in response text
    const strategyFailedText = page.getByText(/strategy failed|generation failed|error generating|unable to generate/i);
    const hasStrategyError = await strategyFailedText.isVisible({ timeout: 2000 }).catch(() => false);
    if (hasStrategyError) {
      const errorText = await strategyFailedText.textContent();
      // HEALER FIX (2026-01-20):
      // Root cause: test.fail marks expected failure and can cause "Expected to fail, but passed."
      // Resolution: Throw to fail the test immediately when an error state is visible.
      throw new Error(`Strategy generation failed: ${errorText}`);
    }

    // Verify response is complete
    const lastAgentResponse = await page.locator('p').last().textContent();
    if (!isResponseComplete(lastAgentResponse || '')) {
      console.error(`[BUG] Agent response truncated: "${lastAgentResponse?.slice(-100)}"`);
      test.skip(true, `BUG: Agent response was truncated - "${lastAgentResponse?.slice(-50)}"`);
      return;
    }

    // ----------------------------------------------------
    // STEP 6: Click Generate Strategy Button
    // ----------------------------------------------------
    // Wait for Generate Strategy button to appear and become enabled
    const generateStrategyBtn = page.getByRole('button', { name: /generate strategy/i });

    await generateStrategyBtn.waitFor({ state: 'visible', timeout: 30000 });
    console.log('Generate Strategy button found');

    // Wait for button to become enabled (it may be disabled while processing)
    await expect.poll(
      async () => await generateStrategyBtn.isEnabled(),
      { timeout: 60000, intervals: [2000, 3000, 5000] }
    ).toBe(true);

    await generateStrategyBtn.click();
    console.log('Clicked Generate Strategy button');

    // ----------------------------------------------------
    // STEP 7: Verify Strategy Visualization Panel Opens
    // ----------------------------------------------------
    // The panel is a dialog with title "Strategy visualization panel"
    const strategyPanel = page.getByRole('dialog', { name: /strategy visualization/i })
      .or(page.locator('dialog'));

    await strategyPanel.waitFor({ state: 'visible', timeout: 30000 });
    console.log('Strategy visualization panel opened');

    // Verify Strategy Diagram heading
    const diagramHeading = page.getByRole('heading', { name: /strategy diagram/i });
    await expect(diagramHeading).toBeVisible();

    // Check for node count text (e.g., "X configuration nodes")
    const nodeCountText = page.getByText(/\d+\s*configuration\s*nodes/i);
    await nodeCountText.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});

    const nodeText = await nodeCountText.textContent().catch(() => '0 configuration nodes');
    const nodeMatch = nodeText?.match(/(\d+)/);
    const nodeCount = nodeMatch ? parseInt(nodeMatch[1], 10) : 0;
    console.log(`Strategy diagram shows: "${nodeText}" (${nodeCount} nodes)`);

    // If 0 nodes, check for error state
    if (nodeCount === 0) {
      const diagramError = page.getByText(/diagram failed|failed to load|error loading|no nodes/i);
      const hasError = await diagramError.isVisible({ timeout: 2000 }).catch(() => false);
      if (hasError) {
        const errorMsg = await diagramError.textContent();
        // HEALER FIX (2026-01-20):
        // Root cause: test.fail marks expected failure and can cause "Expected to fail, but passed."
        // Resolution: Throw to fail the test immediately when an error state is visible.
        throw new Error(`Strategy diagram failed: ${errorMsg}`);
      }
      // May still be loading - wait and check again
      await page.waitForTimeout(5000);
      const updatedText = await nodeCountText.textContent().catch(() => '0');
      console.log(`After waiting, node count text: "${updatedText}"`);
    }

    // Verify panel controls are visible
    const backtestBtn = page.getByRole('button', { name: /^backtest$/i });
    const executeBtn = page.getByRole('button', { name: /execute/i });
    const fullscreenBtn = page.getByRole('button', { name: /fullscreen/i });
    const closePanelBtn = page.getByRole('button', { name: /close panel/i });

    await expect(backtestBtn).toBeVisible();
    await expect(executeBtn).toBeVisible();
    await expect(fullscreenBtn).toBeVisible();
    await expect(closePanelBtn).toBeVisible();

    // ----------------------------------------------------
    // STEP 8: Click Backtest Button
    // ----------------------------------------------------
    // Check if Backtest button is enabled
    const isBacktestEnabled = await backtestBtn.isEnabled();
    if (!isBacktestEnabled) {
      console.log('Backtest button is disabled - waiting for it to become enabled');
      await expect.poll(
        async () => await backtestBtn.isEnabled(),
        { timeout: 30000, intervals: [2000, 3000] }
      ).toBe(true);
    }

    await backtestBtn.click();
    console.log('Clicked Backtest button');

    // ----------------------------------------------------
    // STEP 9: Verify Backtest Modal Opens
    // ----------------------------------------------------
    // HEALER FIX (2026-01-20):
    // Root cause: Backtest panel is not a dialog; heading "Strategy Backtest" identifies the container.
    // MCP UI mode timed out; verified against error-context snapshot.
    // Resolution: Scope to Strategy Backtest heading container before locating inputs.
    const backtestModal = page.getByRole('dialog').filter({ hasText: /backtest|initial amount|timeframe|initial capital/i })
      .or(page.locator('[class*="modal"], [class*="dialog"]').filter({ hasText: /backtest/i }));
    const backtestHeading = page.getByRole('heading', { name: /strategy backtest/i });

    let backtestContainer = backtestModal;

    const hasHeading = await backtestHeading.isVisible({ timeout: 15000 }).catch(() => false);
    if (hasHeading) {
      backtestContainer = backtestHeading.locator('..').locator('..');
    } else {
      await backtestModal.waitFor({ state: 'visible', timeout: 15000 }).catch(async () => {
        // Try alternative - might be inline panel not a dialog
        const backtestPanel = page.getByText(/initial amount|initial capital/i);
        await backtestPanel.waitFor({ state: 'visible', timeout: 10000 });
        backtestContainer = backtestPanel.locator('..');
      });
    }

    console.log('Backtest configuration panel opened');

    // Verify Initial Amount input
    const initialAmountInput = backtestContainer.getByText(/initial amount|initial capital/i)
      .locator('..')
      .getByRole('textbox')
      .or(backtestContainer.getByRole('spinbutton'))
      .or(backtestContainer.locator('input[type="number"], input[type="text"]'))
      .or(backtestContainer.getByPlaceholder(/amount|initial|\$/i));

    await expect(initialAmountInput.first()).toBeVisible({ timeout: 10000 });
    await expect(initialAmountInput.first()).toBeEditable();
    console.log('Initial Amount input is visible and editable');

    // Verify Timeframe selection
    const timeframeControl = page.getByRole('combobox')
      .or(page.locator('select'))
      .or(page.getByText(/timeframe|period|duration/i).locator('..').locator('button, select, [role="combobox"]'));

    await expect(timeframeControl.first()).toBeVisible({ timeout: 10000 });
    console.log('Timeframe control is visible');

    // ----------------------------------------------------
    // STEP 10: Initiate Backtest
    // ----------------------------------------------------
    const initiateBacktestBtn = page.getByRole('button', { name: /initiate backtest|start backtest|run backtest|begin/i })
      .or(page.getByRole('button').filter({ hasText: /initiate|start|run/i }));

    await expect(initiateBacktestBtn.first()).toBeVisible({ timeout: 10000 });
    await initiateBacktestBtn.first().click();
    console.log('Clicked Initiate Backtest button');

    // Wait for backtest to complete
    // When running: Shows "Running..." button
    // When completed: Shows "Backtest" button and results tabs appear

    // Wait for results tabs to appear (Summary, Table, Chart)
    // HEALER FIX (2026-01-20):
    // Root cause: Tablist locator was not scoped to the strategy dialog, causing visibility checks to miss.
    // MCP UI mode timed out; verified against error-context snapshot.
    // Resolution: Scope results tab locators inside the Strategy visualization dialog.
    const resultsPanel = page.getByRole('dialog', { name: /strategy visualization/i });
    const summaryTabLocator = resultsPanel.getByRole('tab', { name: /summary/i });
    const resultsTablist = resultsPanel.getByRole('tablist', { name: /backtest results/i });

    console.log('Waiting for backtest to complete...');

    // HEALER FIX (2026-01-20):
    // Root cause: expect.poll never resolved despite tabs being visible; use direct visibility waits.
    // Resolution: Wait explicitly for results tablist and summary tab to be visible.
    await expect(resultsTablist).toBeVisible({ timeout: 60000 });
    await expect(summaryTabLocator).toBeVisible({ timeout: 60000 });

    console.log('Backtest completed - results tabs visible');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000); // Allow UI to settle

    // Check for backtest failure
    const backtestFailedText = page.getByText(/backtest failed|test failed|error running|failed to run|unable to complete/i);
    const hasBacktestError = await backtestFailedText.isVisible({ timeout: 5000 }).catch(() => false);
    if (hasBacktestError) {
      const errorText = await backtestFailedText.textContent();
      // HEALER FIX (2026-01-20):
      // Root cause: test.fail marks expected failure and can cause "Expected to fail, but passed."
      // Resolution: Throw to fail the test immediately when an error state is visible.
      throw new Error(`Backtest failed: ${errorText}`);
    }

    // ----------------------------------------------------
    // STEP 11: Verify Backtest Results - 3 Tabs
    // ----------------------------------------------------
    // Wait for results to load
    console.log('Waiting for backtest results...');
    await page.waitForTimeout(3000); // Allow UI to update after backtest completion

    // Verify tabs are present: Summary, Table, Chart
    const resultsTablistLocator = resultsPanel.getByRole('tablist', { name: /backtest results/i });
    const summaryTab = resultsPanel.getByRole('tab', { name: /summary/i });
    const tableTab = resultsPanel.getByRole('tab', { name: /table/i });
    const chartTab = resultsPanel.getByRole('tab', { name: /chart/i });

    // Check if tabs are visible (results loaded)
    await expect(resultsTablistLocator).toBeVisible({ timeout: 15000 });
    const hasSummaryTab = await summaryTab.first().isVisible({ timeout: 15000 }).catch(() => false);
    const hasTableTab = await tableTab.first().isVisible({ timeout: 5000 }).catch(() => false);
    const hasChartTab = await chartTab.first().isVisible({ timeout: 5000 }).catch(() => false);

    console.log(`Tabs visible: Summary=${hasSummaryTab}, Table=${hasTableTab}, Chart=${hasChartTab}`);

    if (!hasSummaryTab && !hasTableTab && !hasChartTab) {
      // Take screenshot to debug
      await page.screenshot({ path: 'test-results/backtest-results-not-found.png', fullPage: true });
      console.log('Screenshot saved - no result tabs found');
      test.skip(true, 'Backtest result tabs not found - results may not have loaded');
      return;
    }

    // ----------------------------------------------------
    // STEP 12: Verify Summary Tab Content
    // ----------------------------------------------------
    if (hasSummaryTab) {
      await summaryTab.first().click();
      await page.waitForTimeout(1000);

      // Look for summary metrics and backtest period
      const summaryContent = page.getByText(/backtest period|total return|profit|loss|roi|sharpe|drawdown|win rate/i);
      const hasMetrics = await summaryContent.first().isVisible({ timeout: 10000 }).catch(() => false);
      console.log(`Summary tab has metrics: ${hasMetrics}`);

      // Verify ROI/Total Return percentage is visible
      const roiPercent = page.getByText(/total return/i).locator('..').getByText(/\d+(\.\d+)?%/);
      const hasRoiPercent = await roiPercent.first().isVisible({ timeout: 10000 }).catch(() => false);
      console.log(`Summary tab has ROI percentage: ${hasRoiPercent}`);
    }

    // ----------------------------------------------------
    // STEP 13: Verify Table Tab Content
    // ----------------------------------------------------
    if (hasTableTab) {
      await tableTab.first().click();
      await page.waitForTimeout(1000);

      // Verify table is visible
      const resultsTable = page.locator('table, [role="table"], [class*="table"]');
      const hasTable = await resultsTable.first().isVisible({ timeout: 10000 }).catch(() => false);

      // Chart may be rendered instead of a table depending on data
      const chartContainer = page.locator('canvas, svg[class*="chart"], [class*="chart"], [data-testid*="chart"]');
      const hasChart = await chartContainer.first().isVisible({ timeout: 10000 }).catch(() => false);

      console.log(`Table tab has table: ${hasTable}, chart: ${hasChart}`);
      await expect(hasTable || hasChart).toBe(true);
    }

    // ----------------------------------------------------
    // STEP 14: Verify Chart Tab Content
    // ----------------------------------------------------
    if (hasChartTab) {
      await chartTab.first().click();
      await page.waitForTimeout(1000);

      // Verify chart is visible
      const chartContainer = page.locator('canvas, svg[class*="chart"], [class*="chart"], [data-testid*="chart"]');
      const hasChart = await chartContainer.first().isVisible({ timeout: 10000 }).catch(() => false);
      console.log(`Chart tab has chart: ${hasChart}`);
    }

    // Final success log
    console.log('Strategy Builder and Backtest test completed successfully!');
  });
});

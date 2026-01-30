import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class StrategyBuilderPanel extends BasePage {
  // ---------- Strategy UI ----------
  readonly generateStrategyButton: Locator;
  readonly strategyDialog: Locator;
  readonly diagramHeading: Locator;
  readonly nodeCountText: Locator;
  readonly backtestButton: Locator;
  readonly executeButton: Locator;
  readonly fullscreenButton: Locator;
  readonly closePanelButton: Locator;
  readonly strategyErrorText: Locator;
  readonly diagramErrorText: Locator;

  // ---------- Backtest UI ----------
  readonly backtestHeading: Locator;
  readonly backtestContainer: Locator;
  readonly backtestDialogFallback: Locator;
  readonly backtestErrorText: Locator;
  readonly backtestPanelFallback: Locator;

  // ---------- Results UI ----------
  readonly resultsPanel: Locator;
  readonly resultsTablist: Locator;
  readonly summaryTab: Locator;
  readonly tableTab: Locator;
  readonly chartTab: Locator;
  readonly summaryContent: Locator;
  readonly roiPercent: Locator;
  readonly resultsTable: Locator;
  readonly chartContainer: Locator;
  readonly tradeHistoryText: Locator;

  constructor(page: Page) {
    super(page);

    this.generateStrategyButton = page.getByRole('button', { name: /generate strategy/i });
    this.strategyDialog = page.getByTestId('strategy-panel');
    this.diagramHeading = page.getByRole('heading', { name: /strategy diagram/i });
    this.nodeCountText = page.getByTestId('strategy-node-count');
    // HEALER FIX (2026-01-30): Button renamed from "Backtest" to "Simulate"
    this.backtestButton = page.getByRole('button', { name: /^simulate$/i });
    this.executeButton = page.getByRole('button', { name: /execute/i });
    this.fullscreenButton = page.getByRole('button', { name: /fullscreen/i });
    this.closePanelButton = page.getByRole('button', { name: /close panel/i });
    this.strategyErrorText = page.getByTestId('strategy-generation-error-message');
    this.diagramErrorText = page.getByTestId('strategy-generation-error-message');

    this.backtestHeading = page.getByRole('heading', { name: /strategy backtest/i });
    this.backtestContainer = page.getByTestId('strategy-panel');
    this.backtestDialogFallback = page.getByTestId('strategy-backtest-modal');
    this.backtestPanelFallback = page.getByTestId('strategy-panel');
    this.backtestErrorText = page.getByTestId('backtest-error-message');

    this.resultsPanel = this.strategyDialog;
    this.resultsTablist = page.getByTestId('backtest-results-tabs');
    this.summaryTab = page.getByTestId('backtest-results-tab-summary');
    this.tableTab = page.getByTestId('backtest-results-tab-table');
    this.chartTab = page.getByTestId('backtest-results-tab-chart');
    this.summaryContent = page.getByTestId('backtest-summary-title');
    this.roiPercent = page.getByTestId('backtest-total-return');
    this.resultsTable = page.getByTestId('strategy-panel').locator('table, [role="table"]');
    this.chartContainer = page.getByTestId('strategy-panel').locator('canvas, svg');
    this.tradeHistoryText = page.getByTestId('backtest-trade-history-heading');
  }

  // HEALER FIX (2026-01-30): Updated selectors for new Simulation modal UI
  // Root cause: Modal was redesigned - testids no longer exist
  // Resolution: Use label/role-based selectors instead
  getInitialCapitalInput(): Locator {
    // The textbox is labeled "Initial Capital" and contains currency value
    return this.page.getByRole('textbox', { name: /initial capital/i }).or(
      this.page.locator('input[type="text"]').filter({ hasText: /1,?000/ })
    );
  }

  getTimeframeControl(): Locator {
    // The combobox is for "Backtest Period"
    return this.page.getByRole('combobox').filter({ has: this.page.locator('option:has-text("1 Month")') });
  }

  getInitiateBacktestButton(): Locator {
    // Button text is "INITIATE BACKTEST"
    return this.page.getByRole('button', { name: /initiate backtest/i });
  }
}

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
    // HEALER FIX (2026-01-30): Strategy dialog is a dialog with title "Strategy visualization panel"
    this.strategyDialog = page.getByRole('dialog', { name: /strategy visualization panel/i });
    this.diagramHeading = page.getByRole('heading', { name: /strategy diagram/i });
    // HEALER FIX (2026-01-30): Node count text is a paragraph with "X configuration nodes"
    this.nodeCountText = page.getByText(/\d+\s*configuration\s*nodes/i);
    // HEALER FIX (2026-01-30): Button renamed from "Backtest" to "Simulate"
    this.backtestButton = page.getByRole('button', { name: /^simulate$/i });
    this.executeButton = page.getByRole('button', { name: /execute/i });
    // HEALER FIX (2026-01-30): Button name is "Open fullscreen"
    this.fullscreenButton = page.getByRole('button', { name: /open fullscreen/i });
    this.closePanelButton = page.getByRole('button', { name: /close panel/i });
    this.strategyErrorText = page.getByTestId('strategy-generation-error-message');
    this.diagramErrorText = page.getByTestId('strategy-generation-error-message');

    // HEALER FIX (2026-01-30): Modal renamed from "Strategy Backtest" to "Strategy Simulation"
    this.backtestHeading = page.getByRole('heading', { name: /strategy simulation/i });
    this.backtestContainer = page.getByTestId('strategy-panel');
    this.backtestDialogFallback = page.getByTestId('strategy-backtest-modal');
    this.backtestPanelFallback = page.getByTestId('strategy-panel');
    this.backtestErrorText = page.getByTestId('backtest-error-message');

    this.resultsPanel = this.strategyDialog;
    this.resultsTablist = page.getByTestId('strategy-panel').getByTestId('backtest-results-tabs');
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
  // Root cause: Modal was redesigned - textbox accessible name is "1,000" (from placeholder), not "Initial Capital"
  // Inspector verification (error-context.md line 155):
  //   - Found: textbox "1,000" [ref=e237]: "1000"
  //   - The textbox accessible name is "1,000" (the placeholder text)
  // Resolution: Use getByRole with name matching placeholder "1,000"
  getInitialCapitalInput(): Locator {
    // The textbox accessible name is "1,000" (from placeholder)
    return this.page.getByRole('textbox', { name: '1,000' });
  }

  getTimeframeControl(): Locator {
    // The combobox contains "1 Month" option - find by role
    return this.page.getByRole('combobox');
  }

  getInitiateBacktestButton(): Locator {
    // Button text is "INITIATE BACKTEST"
    return this.page.getByRole('button', { name: /initiate backtest/i });
  }
}

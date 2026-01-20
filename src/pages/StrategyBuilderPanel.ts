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
    this.strategyDialog = page.getByRole('dialog', { name: /strategy visualization/i }).or(page.locator('dialog'));
    this.diagramHeading = page.getByRole('heading', { name: /strategy diagram/i });
    this.nodeCountText = page.getByText(/\d+\s*configuration\s*nodes/i);
    this.backtestButton = page.getByRole('button', { name: /^backtest$/i });
    this.executeButton = page.getByRole('button', { name: /execute/i });
    this.fullscreenButton = page.getByRole('button', { name: /fullscreen/i });
    this.closePanelButton = page.getByRole('button', { name: /close panel/i });
    this.strategyErrorText = page.getByText(/strategy failed|generation failed|error generating|unable to generate/i);
    this.diagramErrorText = page.getByText(/diagram failed|failed to load|error loading|no nodes/i);

    this.backtestHeading = page.getByRole('heading', { name: /strategy backtest/i });
    this.backtestContainer = this.backtestHeading.locator('..').locator('..');
    this.backtestDialogFallback = page.getByRole('dialog').filter({
      hasText: /backtest|initial amount|timeframe|initial capital/i,
    });
    this.backtestErrorText = page.getByText(
      /backtest failed|test failed|error running|failed to run|unable to complete/i
    );

    this.resultsPanel = this.strategyDialog;
    this.resultsTablist = this.resultsPanel.getByRole('tablist', { name: /backtest results/i });
    this.summaryTab = this.resultsPanel.getByRole('tab', { name: /summary/i });
    this.tableTab = this.resultsPanel.getByRole('tab', { name: /table/i });
    this.chartTab = this.resultsPanel.getByRole('tab', { name: /chart/i });
    this.summaryContent = this.resultsPanel.getByText(
      /backtest period|total return|profit|loss|roi|sharpe|drawdown|win rate/i
    );
    this.roiPercent = this.resultsPanel.getByText(/total return/i).locator('..').getByText(/\d+(\.\d+)?%/);
    this.resultsTable = this.resultsPanel.locator('table, [role="table"], [class*="table"]');
    this.chartContainer = this.resultsPanel.locator(
      'canvas, svg[class*="chart"], [class*="chart"], [data-testid*="chart"]'
    );
    this.tradeHistoryText = this.resultsPanel.getByText(/trade history|trades executed/i);
  }

  getInitialCapitalInput(): Locator {
    return this.backtestContainer
      .getByText(/initial amount|initial capital/i)
      .locator('..')
      .getByRole('textbox')
      .or(this.backtestContainer.getByRole('spinbutton'))
      .or(this.backtestContainer.locator('input[type="number"], input[type="text"]'))
      .or(this.backtestContainer.getByPlaceholder(/amount|initial|\$/i));
  }

  getTimeframeControl(): Locator {
    return this.backtestContainer
      .getByRole('combobox')
      .or(this.backtestContainer.locator('select'))
      .or(this.backtestContainer.getByText(/timeframe|period|duration/i).locator('..').locator('button, select, [role="combobox"]'));
  }

  getInitiateBacktestButton(): Locator {
    return this.backtestContainer
      .getByRole('button', { name: /initiate backtest|start backtest|run backtest|begin/i })
      .or(this.backtestContainer.getByRole('button').filter({ hasText: /initiate|start|run/i }));
  }
}

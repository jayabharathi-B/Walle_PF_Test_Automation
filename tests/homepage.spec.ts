import { test, expect } from '@playwright/test';
import { HomePage } from '../src/pages/HomePage';

test('verify homepage content', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.logo).toBeVisible();

    await expect(page.getByText('Welcome')).toBeVisible();
    await expect(page.getByText('Create Your Agent')).toBeVisible();
    await expect(page.getByText('EXPLORE AGENTS')).toBeVisible();

    await expect(home.scanBestPerformersBtn).toBeVisible();
    await home.clickScanBestPerformers();
    await expect(home.scanInput).toHaveValue(/scan top 5 tokens by 7d ROI and volume/i);

    await expect(home.analyzeMarketSentimentBtn).toBeVisible();
    await home.clickAnalyzeMarketSentiment();
    await expect(home.scanInput).toHaveValue(/analyze overall crypto sentiment using social/i);

    await expect(home.buildDefiStrategiesBtn).toBeVisible();
    await home.clickBuildDefiStrategies();
    await expect(home.scanInput).toHaveValue(/build a 3-token DeFi strategy with medium risk and stable yield/i);

    const plusbtn = home.plusButton(0);
    await expect(plusbtn).toBeEnabled();
    await home.clickPlus(0);

    await expect(home.popup).toBeVisible();
    await expect(home.popup.getByText(/Read on-chain data/i)).toBeVisible();
    await home.popup.getByText(/Read on-chain data/i).click();
    await expect(home.scanInput).toHaveValue(/scan/i);

    await home.clickPlus(0);
    await expect(home.popup.getByText(/Evaluate portfolio trends/i)).toBeVisible();
    await home.popup.getByText(/Evaluate portfolio trends/i).click();
    await expect(home.scanInput).toHaveValue(/analyze/i);

    await home.clickPlus(0);
    await expect(home.popup.getByText(/Create trading strategies/i)).toBeVisible();
    await home.popup.getByText(/Create trading strategies/i).click();
    await expect(home.scanInput).toHaveValue(/build/i);

    await expect(page.getByText('Deep analysis')).toBeEnabled();
});
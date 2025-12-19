import { test, expect } from '../src/fixtures/home.fixture.ts';
import { HomePage } from '../src/pages/HomePage';
import { assertTooltip } from '../src/utils/tooltip.helper';


test('verify homepage content', async ({ home, page }) => {
    

    await expect(home.welcomeText).toBeVisible();
    await expect(home.createAgentText).toBeVisible();
    await expect(home.exploreAgentsText).toBeVisible();
    await expect(home.logo).toBeVisible();

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

test('verify navigation bar links', async ({ page, home }) => {
    await home.goto();

   
    await assertTooltip(page, 'Dashboard');
    await assertTooltip(page, 'Leaderboard');
    await assertTooltip(page, 'My Agents');
    await assertTooltip(page, 'Chat');
    

    await page.getByRole('button', { name: 'My Agents' }).click();
    await expect(page).toHaveURL(/.*my-agents/);

    await page.getByLabel('Go to home page').click();
    await expect(page).toHaveURL(/.*walle.xyz/);

    await page.getByRole('button', { name: 'Chat' }).click();
    await expect(page).toHaveURL(/.*chat/);

    await page.getByLabel('Go to home page').click();
    await expect(page).toHaveURL(/.*walle.xyz/);

    await page.getByRole('button', { name: 'Leaderboard' }).click();
    await expect(page).toHaveURL(/.*leaderboard/);

    await page.getByRole('button', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/.*walle.xyz/);

   

});
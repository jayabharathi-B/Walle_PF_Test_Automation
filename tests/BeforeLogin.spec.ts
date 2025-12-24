import { test, expect } from '../src/fixtures/home.fixture';
import { assertTooltip } from '../src/utils/tooltip.helper';
import { walletTestCases } from '../src/utils/testData/walletTestData';

test.describe.configure({ mode: 'serial' });

// ----------------------------------------------------
// Verify homepage content
// ----------------------------------------------------
test('verify homepage content', async ({ home, page }) => {
  await home.resetState();
  await expect(home.welcomeText).toBeVisible();
  await expect(home.createAgentText).toBeVisible();
  await expect(home.exploreAgentsText).toBeVisible();

  await expect(home.scanBestPerformersBtn).toBeVisible();
  await home.scanBestPerformersBtn.click();
  await expect(home.scanInput).toHaveValue(
    /scan top 5 tokens by 7d ROI and volume/i
  );

  await expect(home.analyzeMarketSentimentBtn).toBeVisible();
  await home.analyzeMarketSentimentBtn.click();
  await expect(home.scanInput).toHaveValue(
    /analyze overall crypto sentiment using social/i
  );

  await expect(home.buildDefiStrategiesBtn).toBeVisible();
  await home.buildDefiStrategiesBtn.click();
  await expect(home.scanInput).toHaveValue(
    /build a 3-token DeFi strategy with medium risk and stable yield/i
  );

  const plusBtn = home.plusButton(0);
  await expect(plusBtn).toBeEnabled();

  await home.clickPlus(0);
  await expect(home.popup).toBeVisible();
  await home.popup.getByText(/Read on-chain data/i).click();
  await expect(home.popup).toBeHidden();
  await expect(home.scanInput).toHaveValue(/scan/i);

  await home.clickPlus(0);
  await home.popup.getByText(/Evaluate portfolio trends/i).click();
  await expect(home.popup).toBeHidden();
  await expect(home.scanInput).toHaveValue(/analyze/i);

  await home.clickPlus(0);
  await home.popup.getByText(/Create trading strategies/i).click();
  await expect(home.popup).toBeHidden();
  await expect(home.scanInput).toBeVisible();
  await expect.poll(async () => home.scanInput.inputValue(), {timeout: 10000,}).toMatch(/build/i);

  await expect(page.getByText('Deep analysis')).toBeEnabled();
});

// ----------------------------------------------------
// Verify navigation bar links
// ----------------------------------------------------
test('verify navigation bar links', async ({ home, page }) => {
  await home.resetState();
  await assertTooltip(page, 'Dashboard');
  await assertTooltip(page, 'Leaderboard');
  await assertTooltip(page, 'My Agents');
  await assertTooltip(page, 'Chat');

  await home.goToMyAgents();
  await expect(page).toHaveURL(/my-agents/);

  await home.goHome();
  await expect(page).toHaveURL(/walle\.xyz/);

  await home.goToChat();
  await expect(page).toHaveURL(/chat/);

  await home.goHome();
  await home.goToLeaderboard();
  await expect(page).toHaveURL(/leaderboard/);

  await home.ensureNoModalOpen();
  await home.goToDashboard();
  await expect(page).toHaveURL(/walle\.xyz/);
});

// ----------------------------------------------------
// Verify connect wallet modal
// ----------------------------------------------------
test('verify connect wallet', async ({ home, page }) => {
  await home.resetState();
  await home.openConnectWalletModal();

  await expect(home.connectToContinueText).toBeVisible();

  // ✅ Correct ARIA-based button assertions
  await expect(home.loginWithGoogleBtn).toBeVisible();
  await expect(home.loginWithXBtn).toBeVisible();

  await expect(home.connectWalletBtn).toBeEnabled();

  await home.clickConnectAWalletOption();
  await expect(page.getByText('MetaMask')).toBeVisible();
});

// ----------------------------------------------------
// Verify create agent before login
// ----------------------------------------------------
test('verify create your agent before login', async ({ home }) => {
  await home.resetState();
  await home.selectChain('Ethereum');
  await expect(home.getSelectedChain('Ethereum')).toBeVisible();

  await home.enterWallet(
    '0x8fCb871F786aac849410cD2b068DD252472CdAe9'
  );
  await home.clickSearch();

  await expect(home.signupPrompt).toBeVisible();
});

// ----------------------------------------------------
// Wallet validation test matrix
// ----------------------------------------------------
walletTestCases.forEach(({ title, chain, input, expectsInlineError, expectsSubmitBlocked }) => {
    test(title, async ({ home }) => {
      await home.selectChain(chain);
      await home.enterWallet(input);

      const error = home.getInlineError();
      const submitBtn = home.getSubmitButton();

      if (expectsInlineError) {
        await expect(error).toBeVisible();
      } else {
        await expect(error).toBeHidden();
      }

      if (expectsSubmitBlocked) {
        await expect(submitBtn).toBeDisabled();
      } else {
        await expect(submitBtn).toBeEnabled();
      }
    });
  }
);

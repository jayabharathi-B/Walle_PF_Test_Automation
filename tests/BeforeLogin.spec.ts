import { test, expect } from '../src/fixtures/home.fixture.ts';
import { assertTooltip } from '../src/utils/tooltip.helper';
import { walletTestCases } from '../src/utils/testData/walletTestData.ts';



test('verify homepage content', async ({ home, page }) => {
    await home.goto();

    await expect(home.welcomeText).toBeVisible();
    await expect(home.createAgentText).toBeVisible();
    await expect(home.exploreAgentsText).toBeVisible();
    //await expect(home.logo).toBeVisible();

    await expect(home.scanBestPerformersBtn).toBeVisible();
    await home.scanBestPerformersBtn.click();
    await expect(home.scanInput).toHaveValue(/scan top 5 tokens by 7d ROI and volume/i);

    await expect(home.analyzeMarketSentimentBtn).toBeVisible();
    await home.analyzeMarketSentimentBtn.click();
    await expect(home.scanInput).toHaveValue(/analyze overall crypto sentiment using social/i);

    await expect(home.buildDefiStrategiesBtn).toBeVisible();
    await home.buildDefiStrategiesBtn.click();
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

  await home.goToMyAgents();
  await expect(page).toHaveURL(/.*my-agents/);

  await home.goHome();
  await expect(page).toHaveURL(/.*walle.xyz/);

  await home.goToChat();
  await expect(page).toHaveURL(/.*chat/);

  await home.goHome();
  await expect(page).toHaveURL(/.*walle.xyz/);

  await home.goToLeaderboard();
  await expect(page).toHaveURL(/.*leaderboard/);

  await home.goToDashboard();
  await expect(page).toHaveURL(/.*walle.xyz/);

   

});

test('verify connect wallet', async ({ home, page }) => {
    await home.goto();
  await home.openConnectWalletModal();
 // await expect(home.isConnectToContinueVisible()).toBeVisible();
  await expect(home.connectToContinueText).toBeVisible();


  await expect(home.loginWithGoogleLabel).toBeEnabled();
  await expect(home.loginWithXLabel).toBeEnabled();

  await expect(home.connectWalletBtn).toBeEnabled();
  if (await home.connectWalletBtn.isEnabled()) {
    await home.clickConnectAWalletOption();
    await expect(page.getByText('MetaMask')).toBeVisible();
  }
    
    
});

test('verify create your agent before login', async ({ page, home }) => {
  await home.goto();

  // await home.chainDropdownTrigger.click();
  // // Verify chain options visible
  // const expectedChains = ['Ethereum', 'Base', 'Solana', 'Arbitrum', 'BSC'];

  // for (const chain of expectedChains) {
  //   await expect(home.getChainOption(chain)).toBeVisible();
  // }

  // Select Ethereum and verify
  await home.selectChain('Ethereum');
  await expect(home.getSelectedChain('Ethereum')).toBeVisible();

  // Enter wallet and attempt search
  await home.enterWallet('0x8fCb871F786aac849410cD2b068DD252472CdAe9');
  await home.clickSearch();

  // Verify signup prompt
  await expect(home.signupPrompt).toBeVisible();
});



walletTestCases.forEach(({ title, chain, input, expectsInlineError, expectsSubmitBlocked }) => {
  test(title, async ({ page, home }) => {
    await home.goto();
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
});

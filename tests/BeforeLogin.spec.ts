import { test, expect } from '../src/fixtures/home.fixture';
import { walletTestCases } from '../src/utils/testData/walletTestData';


//test.describe.configure({ mode: 'serial' });


// ----------------------------------------------------
// Verify connect wallet modal
// ----------------------------------------------------
test('verify connect wallet', async ({ home }) => {
  await home.resetState();
  await home.openConnectWalletModal();

  await expect(home.connectToContinueText).toBeVisible();
  await expect(home.connectWalletBtn).toBeEnabled();

  await home.clickConnectAWalletOption();
  await expect(home.connectModal.backBtn).toBeVisible();
  await expect(home.connectModal.newToWalletsText).toBeVisible();
});

// ----------------------------------------------------
// Verify homepage content
// ----------------------------------------------------
test('verify homepage content', async ({ home }) => {
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

  await home.clickPlusAndSelect(0, /Read on-chain data/i);
  await expect(home.scanInput).toHaveValue(/scan/i);

  await home.clickPlusAndSelect(0, /Evaluate portfolio trends/i);
  await expect(home.scanInput).toHaveValue(/analyze/i);

  await home.clickPlusAndSelect(0, /Create trading strategies/i);
  await expect(home.scanInput).toBeVisible();
  await expect.poll(async () => home.scanInput.inputValue(), { timeout: 10000 }).toMatch(/build/i);

  await expect(home.deepAnalysisBtn).toBeEnabled();
});

// ----------------------------------------------------
// Verify navigation bar links
// ----------------------------------------------------
test('verify navigation bar links', async ({ home }) => {
  await home.resetState();
  await home.assertTooltip('Dashboard');
  await home.assertTooltip('Leaderboard');
  await home.assertTooltip('My Agents');
  await home.assertTooltip('Chat');

  await home.goToMyAgents();
  await home.assertURL(/my-agents/);
  await expect(home.connectToContinueText).toBeVisible({ timeout: 10000 });
  await home.closeConnectModal();
  await home.assertURL(/my-agents/);

  await home.goHome();
  await home.assertURL(/walle\.xyz/);

  await home.goToChat();
  await home.assertURL(/chat/);
  await expect(home.connectToContinueText).toBeVisible({ timeout: 10000 });
  await home.closeConnectModal();
  await home.assertURL(/chat/);

  await home.goToDashboard();
  await home.assertURL(/walle\.xyz/);

  await home.goToLeaderboard();
  await home.assertURL(/leaderboard/);
});


// ----------------------------------------------------
// Verify create agent before login
// ----------------------------------------------------
test('verify create your agent before login', async ({ home }) => {
  await home.resetState();
  await home.createAgent('Ethereum', '0x8fCb871F786aac849410cD2b068DD252472CdAe9');
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

// ----------------------------------------------------
// Explore page tests before login
// ----------------------------------------------------
test('Agent profile navigation works from explore page', async ({ home, explore, agentProfile }) => {
  await home.setViewport();
  await home.resetState();
  await home.waitForURL(/walle\.xyz\/?$/);

  const agentName = await explore.clickRandomAgent();

  await agentProfile.waitForProfile();
  await agentProfile.verifyProfileName(agentName);

  await agentProfile.goBack();
  await home.assertURL(/walle\.xyz\/?$/);
});

test('Chat agent guarded actions and back navigation', async ({ home, explore, chat }) => {
  await home.setViewport();
  await home.resetState();
  await home.waitForURL(/walle\.xyz\/?$/);

  const agentName = await explore.selectRandomAgentForChat();

  await chat.waitForChatPage();
  await chat.verifyAgentName(agentName);

  await chat.clickSuggestionButton();
  await home.connectModal.closeIfVisible();

  await chat.sendMessage('hi');
  await home.connectModal.closeIfVisible();

  await chat.goBack();
  await home.assertURL(/walle\.xyz\/?$/);
});

test('Explore page shows agents in all tabs', async ({ home, explore }) => {
  await home.setViewport();
  await home.resetState();
  await explore.validateAllTabs(15);
});

test('Explore agents multi-select and guarded start chat flow', async ({ home, explore, connectModal }) => {
  await home.resetState();
  await home.waitForURL(/walle\.xyz\/?$/);
  await explore.waitForAgentsToLoad();

  // Select first agent
  await explore.selectAgents(1);
  await explore.verifySelectedCount(1);
  await explore.verifyActionButtonState(false, /add agent/i);

  // Select second agent
  await explore.selectAgents(1);
  await explore.verifySelectedCount(2);
  await explore.verifyActionButtonState(true, /start chat/i);

  // Select third agent
  await explore.selectAgents(1);
  await explore.verifySelectedCount(3);
  await explore.verifyActionButtonState(true);

  // Remaining checkboxes should be disabled
  const remainingCheckboxes = explore.agentCards
    .nth(3)
    .getByRole('button');
  await expect(remainingCheckboxes).toBeDisabled();

  // Start chat
  await explore.clickActionButton();

  // Assert guarded modal
  await connectModal.waitForModal();
});

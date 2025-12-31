import { test, expect } from '../src/fixtures/home.fixture';
import { assertTooltip } from '../src/utils/tooltip.helper';
import { walletTestCases } from '../src/utils/testData/walletTestData';



test.describe.configure({ mode: 'serial' });


// ----------------------------------------------------
// Verify connect wallet modal
// ----------------------------------------------------
test('verify connect wallet', async ({ home, page }) => {
  await home.resetState();
  await home.openConnectWalletModal();

  await expect(home.connectToContinueText).toBeVisible();

  // ✅ Correct ARIA-based button assertions
  // await expect(home.loginWithGoogleBtn).toBeVisible();
  // await expect(home.loginWithXBtn).toBeVisible();

  await expect(home.connectWalletBtn).toBeEnabled();

  await home.clickConnectAWalletOption();
  await expect(page.getByText('Back')).toBeVisible();
  await expect(page.getByText(/new to wallets\?/i)).toBeVisible();
});

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
  await expect(home.connectToContinueText).toBeVisible({ timeout: 10000 });
  await home.closeConnectModal();
  await expect(page).toHaveURL(/my-agents/);

  await home.goHome();
  await expect(page).toHaveURL(/walle\.xyz/);

  await home.goToChat();
  await expect(page).toHaveURL(/chat/);
  await expect(home.connectToContinueText).toBeVisible({ timeout: 10000 });
  await home.closeConnectModal();
  await expect(page).toHaveURL(/chat/);

  await home.goToDashboard();
  await expect(page).toHaveURL(/walle\.xyz/);

  await home.goToLeaderboard();
  await expect(page).toHaveURL(/leaderboard/);

  // await home.goToDashboard();
  // await expect(page).toHaveURL(/walle\.xyz/);
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

// ----------------------------------------------------
// Explore page tests before login
// ----------------------------------------------------
test('Agent profile navigation works from explore page', async ({ home, page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home.resetState();

  await page.waitForURL(/walle\.xyz\/?$/);

  const agentLinks = page.locator('a[href^="/agents/"]');
  await expect(agentLinks.first()).toBeVisible({ timeout: 15000 });

  const count = await agentLinks.count();
  const randomIndex = Math.floor(Math.random() * count);

  const selectedAgent = agentLinks.nth(randomIndex);

  const agentNameRaw = await selectedAgent.textContent();
  const agentName = agentNameRaw?.replace('@', '').trim();
  expect(agentName).toBeTruthy();

  console.log(`Selected Agent (profile): ${agentName}`);

  await selectedAgent.click();

  // Profile page URL
  await expect(page).toHaveURL(/\/agents\//);

  // Optional name assertion (only if rendered)
  const agentNameRegex = new RegExp(agentName!.replace(/\s+/g, '\\s+'), 'i');
  const profileName = page.locator('header, main').filter({ hasText: agentNameRegex });

  if (await profileName.count()) {
    await expect(profileName.first()).toBeVisible();
  }

  // Back to Explore
  await page.getByRole('button').first().click();
  await expect(page).toHaveURL(/walle\.xyz\/?$/);
});

test('Explore page shows agents in all tabs', async ({ home, page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home.resetState();

  const tabs = page.getByRole('button', {
    name: /Most Engaged|Recently Created|Top PnL|Most Followed|Top Score/,
    includeHidden: true,
  });

  // Ensure Home / Explore page
  await page.waitForURL(/walle\.xyz\/?$/);

  const agentCards = page.locator('[data-name="Agent Chat/Initial Screen"]');

  // Wait for agents to load (data-based)
  await expect(agentCards.first()).toBeVisible({ timeout: 20000 });

  const tabCount = await tabs.count();
  console.log(`Total tabs found: ${tabCount}`);
  expect(tabCount).toBeGreaterThan(0);

  // Validate each tab
  for (let i = 0; i < tabCount; i++) {
    await tabs.nth(i).click();
    await expect(agentCards).toHaveCount(15, { timeout: 15000 });
  }
});

test('Chat agent guarded actions and back navigation', async ({ home, page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home.resetState();

  await page.waitForURL(/walle\.xyz\/?$/);

  const agentCards = page.locator('[data-name="Agent Chat/Initial Screen"]');
  const agentNameLinks = page.locator('a[href^="/agents/"]');

  await expect(agentCards.first()).toBeVisible({ timeout: 15000 });
  await expect(agentNameLinks.first()).toBeVisible({ timeout: 15000 });

  const cardCount = await agentCards.count();
  const nameCount = await agentNameLinks.count();

  const index = Math.min(
    Math.floor(Math.random() * cardCount),
    nameCount - 1
  );

  const agentName = (
    await agentNameLinks.nth(index).textContent()
  )?.replace('@', '').trim();

  expect(agentName).toBeTruthy();
  console.log(`Selected Agent (chat): ${agentName}`);

  const chatClickTarget = agentCards
    .nth(index)
    .locator('div')
    .filter({ has: page.locator('img[data-nimg]') })
    .first();

  await chatClickTarget.scrollIntoViewIfNeeded();
  await chatClickTarget.click({ force: true });

  // Chat-agent page
  await expect(page).toHaveURL(/chat-agent/i, { timeout: 15000 });

  // Optional agent name in chat
  const chatHeading = page.locator('h1', { hasText: agentName });
  if (await chatHeading.count()) {
    await expect(chatHeading).toBeVisible();
  }

  // Suggestion buttons (guarded)
  const suggestionButtons = page.locator('button:has-text("/")');
  if (await suggestionButtons.count()) {
    await suggestionButtons.first().click({ timeout: 2000, force: true });
  }

  // Connect modal (conditional)
  if (await home.connectToContinueText.count()) {
    await expect(home.connectToContinueText).toBeVisible();
    await home.closeConnectModal();
  }

  // Type message + Enter
  const chatInput = page.locator('textarea');
  await expect(chatInput).toBeVisible();
  await chatInput.fill('hi');
  await chatInput.press('Enter');

  // Modal may reappear
  if (await home.connectToContinueText.count()) {
    await expect(home.connectToContinueText).toBeVisible();
    await home.closeConnectModal();
  }

  // Back to Home
 
  const backBtn = page.getByRole('button', { name: /go\sback/i });
  await backBtn.scrollIntoViewIfNeeded();
  await backBtn.click();

  await expect(page).toHaveURL(/walle\.xyz\/?$/);
});

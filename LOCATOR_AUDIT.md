# Locator Audit (Brittle/CSS/Text/Structural)

Scope: src/pages page objects. List includes locators that rely on CSS classes, structural selectors, text-only, nth/first/last, xpath, or other brittle patterns.

## src/pages/AgentCreationFlow.ts
- agentGenesisModal: `page.locator('div').filter({ has: page.getByRole('heading', { name: 'AGENT GENESIS' }) })` (structural + text filter)
- step1ScanningWallet: `page.getByText('Step 1: Scanning Your Wallet')` (text-only)
- step2ShapingOutlook: `page.getByText("Step 2: Shaping Agent's Outlook")` (text-only)
- step3UnderstandingPortfolio: `page.getByText('Step 3: Understanding Your Portfolio')` (text-only)
- step4DefiningCharacter: `page.getByText('Step 4: Defining Agent Character')` (text-only)
- step5TrainingIntelligence: `page.getByText('Step 5: Training Intelligence')` (text-only)
- step6BringingToLife: `page.getByText('Step 6: Bringing It to Life')` (text-only)
- personalizeModal: `page.locator('div.fixed.inset-0.z-50').filter({ has: page.getByRole('heading', { name: 'Personalize Your Agent Appearance' }) })` (class-based + text filter)
- botWalletErrorModal: `page.locator('div').filter({ hasText: /Wallet Type Not Supported|bot.*wallet|exchange.*wallet/i }).first()` (text-only + first)
- botWalletErrorHeading: `page.locator('h2, h3').filter({ hasText: /Wallet Type Not Supported/i })` (tag + text)
- botWalletErrorMessage: `page.getByText(/bot|exchange wallets/i)` (text-only)
- agentExistsModal: `page.locator('div.fixed.inset-0').filter({ hasText: /This agent already active|agent.*active/i })` (class-based + text)
- agentExistsHeading: `page.locator('h2, h3').filter({ hasText: /already active/i })` (tag + text)
- authGateModal: `page.locator('div').filter({ hasText: /Signup \(or\) SignIn to Continue/i }).first()` (text-only + first)
- authGateCloseButton: `this.authGateModal.locator('button:has(img)').first()` (css + first)
- agentPreviewModal: `page.locator('div.w-full.max-w-md.bg-\[\#28282833\]')` (class-based)
- agentPreviewImage: `page.locator('img[alt="Agent"]').first()` (alt + first)
- agentPreviewName: `page.locator('div.w-full.max-w-md.bg-\[\#28282833\]').locator('generic').nth(2)` (structural + nth)
- discountCodeModal: `heading.getByRole(...).locator('xpath=ancestor::div[@data-testid="launch-confirmation-modal-content"]')` (xpath)
- agentCreatedModal: `heading.getByRole(...).locator('xpath=ancestor::div[contains(@class,"fixed") and contains(@class,"inset-0")]')` (xpath + class)
- getAvatarStyleItem/getAvatarStyleCount: `getByRole('button', { name: /.../ }).nth(index)` (nth + text)
- navigateToMyAgentsAndFindAgent: `page.locator(\`a:has-text("@${agentName}")\`)` (text)
- closeAnyOpenModal overlays: `page.locator('div.fixed.inset-0, div[class*="modal"], div[class*="overlay"], [role="dialog"]')` (class-based)
- closeAnyOpenModal closeButtons: `page.locator('button').filter({ hasText: /^(close|?|cancel|dismiss)$/i })` (text-only)

## src/pages/LeaderboardPage.ts
- leaderboardHeading: `page.locator('p').filter({ hasText: 'LEADERBOARD' }).first()` (text-only + first)
- rankDataColumn: `page.locator('div[class*="w-\[82px\]"][class*="flex-col"]')` (class-based)
- agentNamesColumn: `page.locator('div[class*="w-\[372px\]"][class*="flex-col"]')` (class-based)
- scoresColumn/tradesColumn/chatsColumn: `page.locator('div[class*="basis-0"][class*="grow"][class*="flex-col"]').nth(n)` (class-based + nth)
- agentDetailPanel: `page.locator('div').filter({ has: page.getByRole('button', { name: 'CHAT WITH AGENT' }) })` (structural + text)
- closePanelBtn: `agentDetailPanel.getByText('?', { exact: true })` (text-only)
- getAgentNamesColumn: `agentNamesColumn.locator('> div')` (structural)
- scores/trades/chats row getters: `column.locator('> div').nth(index)` (structural + nth)
- agentBubbles: `page.locator('div.rounded-full').filter({ has: page.locator('img[alt]') })` (class-based)
- nameLocator: `agentDetailPanel.locator('div').first()` (structural + first)

## src/pages/StrategyBuilderPanel.ts
- strategyDialog: `getByRole('dialog', { name: /strategy visualization/i }).or(page.locator('dialog'))` (tag fallback)
- backtestContainer: `backtestHeading.locator('..').locator('..')` (structural parent)
- resultsTable: `locator('table, [role="table"], [class*="table"]')` (class-based)
- chartContainer: `locator('canvas, svg[class*="chart"], [class*="chart"], [data-testid*="chart"]')` (class-based)
- getInitialCapitalInput: `getByText(...).locator('..').getByRole('textbox')` (structural parent)
- getTimeframeControl: `getByText(...).locator('..').locator('button, select, [role="combobox"]')` (structural parent)

## src/pages/QuickSelectModal.ts
- quickSelectModal: `page.locator('.relative.z-10').first()` (class-based + first)
- quickSelectHeading: `page.getByText('Quick Select from OG Agents')` (text-only)
- quickSelectAgentCounter: `page.locator('p').filter({ hasText: /agent[s]?\s+selected/ })` (text-only)
- quickSelectAgentCards: `page.locator('[data-name="Multi-line"]')` (data-name attribute)

## src/pages/HomePage.ts
- chainDropdownMenu: `page.locator('div.absolute.top-full.left-0')` (class-based)
- exampleContainer: `page.locator('.example-questions-container')` (class-based)
- popup: `page.locator('.example-popup-container')` (class-based)
- inlineError: `page.locator('p.text-red-400')` (class-based)
- plusButton: `exampleContainer.locator('button').nth(index)` (structural + nth)
- getChainOption: `page.locator('button').filter({ hasText: chain }).first()` (text-only + first)
- getSelectedChain: `page.locator('button span', { hasText: chain })` (css + text)
- getNavTooltip: `page.locator(\`div.pointer-events-none:has-text("${buttonName}")\`)` (class-based + text)
- hoverNavButtonGroup: `btn.locator('..')` (structural parent)

## src/pages/ChatPage.ts
- chatHeading: `page.locator('h1')` (generic tag)
- chatInput: `page.locator('textarea')` (generic tag)
- suggestionButtons: `page.locator('button:has-text("/")')` (text-only)
- typingIndicatorDots: `page.locator('div.animate-bounce')` (class-based)
- userMessageBubbles: `page.locator('div:has(> img[alt="user-avatar"])')` (structural)
- agentMessageBubbles: `page.locator('div:has(> img[alt]):not(:has(> img[alt="user-avatar"]))')` (structural)
- loadingIndicators: `page.locator('div.animate-bounce, div.animate-pulse, [class*="skeleton"]')` (class-based)
- exploreModalHeading: `page.locator('h1, h2, h3').filter({ hasText: /explore agents/i })` (text-only)
- sessionCards: `page.locator('[data-testid^="session-"], [data-testid^="chat-session-"], main [role="button"]:has(img):not([data-testid*="nav"]):not([data-testid*="sidebar"]):not([data-testid*="header"])')` (complex structural)
- clickRandomExploreAgent/clickExploreAgentByIndex: `card.locator('a, text').first()` (structural + first)
- hasNoSessions: `page.locator('text=/no sessions found/i')` (text-only)
- verifyAgentNameInChat: `page.locator('h1, h2').filter({ hasText: new RegExp(...) })` (text-only)

## src/pages/ExplorePage.ts
- agentLinks: `page.locator('a[href^="/agents/"]')` (css attribute)
- agentCards: `page.locator('[data-name="Agent Chat/Initial Screen"]')` (data-name attribute)
- random agent selection: `agentLinks.nth(randomIndex)` (nth)
- agentNameLinks: `agentNameLinks.nth(index)` (nth)
- agentNameLinks filter: `.filter({ has: page.locator('img[data-nimg]') })` (structural)
- getActionButton: `page.locator('div.fixed.bottom-6')` (class-based)
- getActionButtonImage: `page.locator('div.fixed.bottom-6 img.rounded-full')` (class-based)

## src/pages/ExploreAgentsModal.ts
- exploreModal: `page.locator('[class*="fixed"][class*="inset"]').last()` (class-based + last)
- exploreModalHeading: `page.getByRole('heading', { name: 'EXPLORE AGENTS' }).last()` (last)
- exploreAgentCards: `page.locator('[data-name="Agent Chat/Initial Screen"]')` (data-name attribute)
- exploreDeselectButtons: `exploreModal.locator('div[role="button"][aria-label="Deselect agent"]')` (aria-label + div role)
- mostEngagedTab/recentlyCreatedTab/topPnLTab/mostFollowedTab/topScoreTab: `getByRole(...).last()` (last)
- exploreCancelBtn: `page.getByText('Cancel').last()` (text-only + last)
- exploreAddAgentBtn: `exploreModal.getByRole('button').filter({ hasText: /Add Agent/ })` (text-only)
- clickTab: `page.getByRole('button', { name: tabName }).last()` (last)

## src/pages/AgentSelectionFlow.ts
- getFirstQuickSelectAgentName: `quickSelectModal.locator('p').filter({ hasText: /^@/ }).first()` (text-only + first)
- ensureNoModalOpen: `page.locator('[role="dialog"]')`, `page.locator('[data-portal="safe-portal"]')` (role/portal structural)

## src/pages/AgentProfilePage.ts
- backBtn: `page.getByRole('button').first()` (generic + first)
- profileName: `page.locator('header, main')` (structural)

## src/pages/AgentChatInput.ts
- agentThumbnailContainer: `page.locator('.flex.items-center.gap').first()` (class-based + first)
- agentThumbnails: `page.locator('button', { hasText: '?' })` (text-only)
- getRemoveAgentButton: `img[alt="${agentName}"]).locator('../..').locator('button:has-text("?")')` (structural + text)

## src/pages/ConnectModal.ts
- backBtn: `page.getByText('Back')` (text-only)
- newToWalletsText: `page.getByText(/new to wallets\?/i)` (text-only)

## src/pages/PurchaseModal.ts
- modal: `page.getByText(/setup a deposit account|fund your deposit account/i).locator('../..')` (text-only + parent)
- modalHeading: `page.locator('text=/setup a deposit account|fund your deposit account/i')` (text-only)
- depositAddressLabel: `page.getByText(/deposit address.*base chain/i)` (text-only)
- depositAddressValue: `modal.locator('input[readonly]').first()` (css + first)
- transferFromLabel/transferToLabel: `modal.getByText(/^from$/i)` / `modal.getByText(/^to$/i)` (text-only)
- transferAmountInput: `modal.locator('input[type="number"]')` (css)

## src/pages/MyAgentsPage.ts
- paginationContainer: `page.locator('div.mt-6.pt-4.px-2.pb-2.flex.justify-center.items-center.gap-4')` (class-based)
- paginationStatus: `paginationContainer.locator('span.text-sm.text-white/60.px-3')` (class-based)
- getAgentLinkByHandle/getAgentLinkByName: `a:has-text(...)` (text-only)
- getLaunchedTag/getAnalysedTag: `text=LAUNCHED`, `text=ANALYSED` (text-only)
- signInError: `page.locator('text=Sign In Required')` (text-only)
- pageContainsText: `page.locator('body').textContent()` (generic)

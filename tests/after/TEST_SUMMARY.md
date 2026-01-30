# Test Summary: After Login Tests

> **Purpose**: Tests that run WITH authentication (authenticated state)
> **Last Updated**: 2026-01-30
> **Test Project**: `authenticated-tests` (configured in `playwright.config.ts`)
> **Storage State**: `auth/google.json` (Google OAuth tokens)

---

## Overview

These tests verify functionality available to LOGGED IN users. They test:
- Authentication state and wallet display
- Credits flow and purchase modal
- Agent chat UI and messaging
- Agent creation flow (full journey)
- Chat sessions management
- My Agents page navigation
- Strategy builder and backtest

---

## Test Files

### 1. AuthenticationState.spec.ts

#### Test: `should display wallet address in header after authentication`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Wallet address appears in header when logged in |
| **Preconditions** | User is authenticated via storage state |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to homepage | Page loads |
| 2 | Wait for wallet button | Visible within 15s |
| 3 | Get wallet address | Format: `0x{4chars}...{4chars}` |
| 4 | Assert CONNECT WALLET button | Hidden |
| 5 | Assert authenticated | `isAuthenticated() === true` |

---

#### Test: `should open dropdown when clicking wallet address button`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Wallet dropdown opens on click |
| **Preconditions** | User is authenticated |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to homepage | Page loads |
| 2 | Wait for wallet button | Visible |
| 3 | Assert dropdown closed | `isDropdownOpen() === false` |
| 4 | Click wallet button | Dropdown opens |
| 5 | Assert dropdown open | `isDropdownOpen() === true` |

---

#### Test: `should have disconnect option in dropdown`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Disconnect option exists in wallet dropdown |
| **Preconditions** | User is authenticated |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to homepage | Page loads |
| 2 | Open wallet dropdown | Dropdown opens |
| 3 | Assert disconnect button | Visible with "Disconnect" text |

---

#### Test: `should logout when clicking disconnect`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Clicking disconnect logs user out |
| **Preconditions** | User is authenticated |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to homepage | Page loads |
| 2 | Assert authenticated | Wallet button visible, CONNECT hidden |
| 3 | Open dropdown and click disconnect | Logout triggered |
| 4 | Wait for wallet button to hide | Hidden within 10s |
| 5 | Assert unauthenticated | CONNECT WALLET visible, `isAuthenticated() === false` |

---

#### Test: `should close dropdown when clicking outside`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Dropdown closes when clicking outside |
| **Preconditions** | User is authenticated |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to homepage | Page loads |
| 2 | Open wallet dropdown | Dropdown visible |
| 3 | Click outside dropdown | Dropdown closes |
| 4 | Assert dropdown hidden | `isDropdownOpen() === false` |

---

#### Test: `should maintain authenticated state on page reload`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Auth persists after page reload |
| **Preconditions** | User is authenticated |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to homepage | Page loads |
| 2 | Get wallet address | Address captured |
| 3 | Reload page | Page reloads |
| 4 | Assert still authenticated | Same wallet address displayed |

---

### 2. CreditsFlow.spec.ts

#### Test: `should complete entire credits purchase flow`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Complete credits purchase journey |
| **Preconditions** | User is authenticated |
| **Test Data** | Custom amount: `5252` |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to homepage | Page loads |
| 2 | Wait for credits button | Visible within 15s |
| 3 | Navigate to /credits | URL is `/credits` |
| 4 | Assert balance display | Balance label and value visible |
| 5 | Click refresh | Balance refreshes |
| 6 | Assert purchase button not visible initially | Hidden |
| 7 | Assert "Select package" message | Visible |
| 8 | Click $1 package | Total Amount Due visible |
| 9 | Click $10 package | Total Amount Due visible |
| 10 | Click $20 package | Total Amount Due visible |
| 11 | Click $50 package | Total Amount Due visible |
| 12 | Enter custom amount "5252" | Total shows "$5252" |
| 13 | Click "Purchase Credits" | Modal opens |
| 14 | Check if setup required | If yes, test ends (ThirdWeb limitation) |
| 15 | Assert "Fund Your Deposit Account" heading | Visible |
| 16 | Assert External Deposit tab | Visible |
| 17 | Assert deposit address | Format: `0x{40 hex chars}` |
| 18 | Click copy address | Button clickable |
| 19 | Assert current balance section | USDC balance visible |
| 20 | Click refresh in modal | Balance refreshes |
| 21 | Assert error messages | "Insufficient Balance" with "$5252.00" |
| 22 | Click Transfer tab | Tab visible |
| 23 | Close modal | Modal hidden |
| 24 | Assert still on /credits | URL unchanged |
| 25 | Click home logo | Navigates to homepage |
| 26 | Assert Welcome heading | Visible |
| 27 | Assert still authenticated | Wallet address visible |

---

### 3. AgentChatUi.spec.ts

#### Test: `should send messages, show responses, and decrement credits`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Chat messaging flow with credit consumption |
| **Preconditions** | User is authenticated, has >= 50 credits |
| **Test Data** | From `chatPrompts.ts`: `/scan top performing token in 30d`, `/analyze trade volume...` |
| **Timeout** | 120 seconds |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /chat | Page title visible |
| 2 | Click add agent button | Explore modal opens |
| 3 | Double-click random agent card | Chat interface loads |
| 4 | Wait for network idle | Page stabilizes |
| 5 | Get credits value | Skip if 0 or < 50 credits |
| 6 | Assert chat input | Visible |
| 7 | Assert send button | Visible but disabled |
| 8 | Assert add agents button | Visible |
| 9 | Get header credits before | Value captured |
| 10 | Count user messages before | Count captured |
| 11 | Fill first message and send | Message sent |
| 12 | Wait for user message count to increase | New message appears |
| 13 | Wait for typing indicator to finish | Response complete |
| 14 | Verify response not truncated | `isResponseComplete()` check |
| 15 | Assert credits decreased | Less than before |
| 16 | Send second message | Message sent |
| 17 | Wait for response | Response appears |
| 18 | Verify second response not truncated | `isResponseComplete()` check |
| 19 | Assert credits decreased again | Less than after first |
| 20 | Reload page | Page reloads |
| 21 | Assert messages persisted | Same or more user messages |

**Helper Functions:**
- `parseCredits(text)`: Extracts number from credit text (handles commas)
- `isResponseComplete(text)`: Checks for truncation patterns (ellipsis, incomplete words)
- `getLastAgentMessageText(locator)`: Polls for agent response text

---

### 4. AgentCreationFlow.spec.ts

#### Test: `should complete full agent creation flow with valid wallet`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Complete agent creation from start to My Agents verification |
| **Preconditions** | User is authenticated |
| **Test Data** | Random unused wallet from `walletAddresses.ts` |
| **Timeout** | 720 seconds (12 minutes) |

| Step | Name | Action | Expected Result |
|------|------|--------|-----------------|
| 1 | Navigate to Homepage | Go to homepage | "Create Your Agent" visible |
| 2 | Select Chain | Select chain from dropdown | Chain name in dropdown |
| 3 | Enter Wallet Address | Enter wallet | Input has value, search enabled |
| 4 | Click Search | Click search button | Agent Genesis modal opens |
| 5 | Check Bot Wallet Error | Check if bot wallet error | If yes, skip test |
| 6 | Check Agent Exists | Check if agent exists error | If yes, skip test |
| 7 | Wait for Scanning | Wait for scanning steps | Scanning completes |
| 7.5 | Recheck Agent Exists | Check again after scanning | If yes, skip test |
| 8 | Select Gender | Select "Male" | Male/Female buttons visible |
| 8.5 | Check Auth Gate | Dismiss if auth modal appears | Modal dismissed |
| 9 | Select Avatar Style | Select first avatar | Avatar visible |
| 10 | Confirm Style | Click "Select Style" | Style confirmed |
| 10.5 | Mark Wallet Used | Save to usedWalletAddresses.json | Wallet locked |
| 11 | Wait for Preview | Wait up to 12 minutes | Preview image visible |
| 12 | Launch Agent | Click "Launch Agent" | Agent launching |
| 13 | Check Discount Modal | Enter discount if modal appears | Modal handled |
| 15 | Click Chat Button | Click "Chat with Agent" | Navigates to /chat/ |
| 16 | Verify Chat Navigation | Check URL | URL contains `/chat/sess_` |
| 17 | Verify Agent Details | Check agent name in chat | Name visible |
| 18 | Verify in My Agents | Navigate to My Agents | Agent with LAUNCHED tag found |
| 19 | Complete | Test done | All steps passed |

---

#### Test: `should show error modal for bot/exchange wallet address`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Bot wallet addresses are rejected |
| **Preconditions** | User is authenticated |
| **Test Data** | Binance Cold Wallet from `botWalletAddresses.ethereum[0]` |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to homepage | Page loads |
| 2 | Select Ethereum | Chain selected |
| 3 | Enter bot wallet address | Address entered |
| 4 | Click search | Genesis modal opens |
| 5 | Handle auth gate if appears | Modal dismissed |
| 6 | Handle personalization if appears | Style selected |
| 7 | Wait for bot wallet error | Error modal visible |
| 8 | Assert error elements | Heading, message, close button visible |
| 9 | Close error modal | Modal hidden |

---

#### Test: `should show agent already exists modal and allow chat navigation`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Previously created agent shows "already exists" modal |
| **Preconditions** | User is authenticated, previous agent exists |
| **Test Data** | First address from `usedWalletAddresses.json` |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to homepage | Page loads |
| 2 | Read used wallet address | Address from JSON file |
| 3 | Select Ethereum, enter address | Address entered |
| 4 | Click search | Genesis modal opens |
| 5 | Wait for "Agent Exists" modal | Modal visible |
| 6 | Assert modal elements | Heading, chat button visible |
| 7 | Click "Chat with Agent" | Navigates to /chat |

---

### 5. ChatSessionsFlow.spec.ts

#### Test: `should navigate through chat sessions, explore agents modal, and initiate chats`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Chat sessions page navigation and agent selection |
| **Preconditions** | User is authenticated |
| **Test Data** | None |
| **Timeout** | 90 seconds |

| Step | Name | Action | Expected Result |
|------|------|--------|-----------------|
| 1 | Navigate to Chat | Go to /chat | Page loads |
| 2 | Verify Page Title | Assert title | "Chat" text visible |
| 3 | Check Sessions | Get session count | Handle 0 or > 0 cases |
| 4 | Open Explore Modal | Click add agent button | Modal opens |
| 5 | Verify Explore Modal | Assert heading, count agents | Heading visible, 15 agents |
| 6 | Select Random Agent | Double-click random agent card | Agent selected |
| 7 | Verify Chat Interface | Check URL | URL contains `/chat` |
| 8 | Return to Sessions | Click sidebar | Returns to chat list |
| 9 | Verify Returned | Assert title | "Chat" text visible |
| 10 | Test Session Click | If sessions exist, click first | Chat loads |

**Key Fix (2026-01-30):**
- Agent selection uses **double-click** on card container (not single-click checkbox)
- Single-click = select for multi-agent chat
- Double-click = open 1:1 chat

---

### 6. MyAgentsFlow.spec.ts

#### Test: `should navigate through My Agents page, profile, and chat with complete verification`
| Attribute | Details |
|-----------|---------|
| **What it tests** | My Agents page navigation, profile, chat access |
| **Preconditions** | User is authenticated, has agents |
| **Test Data** | None |
| **Timeout** | 60 seconds |

| Step | Name | Action | Expected Result |
|------|------|--------|-----------------|
| 1 | Navigate to My Agents | Go to /my-agents | Page loads |
| 2 | Assert Page Title | Check title | "My Agents" text |
| 3 | Verify Agent Cards | Check first 5 cards | Cards enabled, images visible, tags present |
| 4 | Click Agent Name | Click first agent link | Navigates to profile |
| 5 | Verify Profile | Check URL | Contains `/agents/{uuid}` |
| 6 | Click Chat Button | Click "CHAT WITH AGENT" | Navigates to chat |
| 7 | Click My Agents Sidebar | Navigate back | Returns to My Agents |
| 8 | Click Card Body | Click second card body | Navigates to chat |

**Key Fixes (2026-01-30):**
- Agent cards selector uses `div[data-testid^="agent-card-"]:not([data-testid*="link"])` to exclude link elements
- Only checks first 5 cards to avoid lazy-load image issues
- Chat button uses `getByRole('button', { name: 'CHAT WITH AGENT' })` instead of testid

---

### 7. StrategyBuilderBacktest.spec.ts

#### Test: `should build strategy, view diagram, and run backtest`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Strategy generation, diagram visualization, backtest execution |
| **Preconditions** | User is authenticated, has >= 100 credits |
| **Test Data** | `/build a $1K portfolio using MA crossover and sentiment signals` |
| **Timeout** | 360 seconds (6 minutes) |

| Step | Name | Action | Expected Result |
|------|------|--------|-----------------|
| 1 | Navigate to Chat | Go to /chat | Page loads |
| 2 | Open Explore Modal | Click add agent button | Modal opens |
| 3 | Select Agent | Double-click random agent | Chat loads |
| 4 | Check Credits | Get credits value | Skip if < 100 |
| 5 | Send /build Command | Send strategy prompt | Message sent |
| 6 | Wait for Loading | Wait for skeletons to disappear | Loading complete |
| 7 | Check Strategy Error | If error visible, fail test | No error |
| 8 | Click Generate Strategy | Click button when enabled | Strategy dialog opens |
| 9 | Verify Diagram | Check heading, node count | "Strategy Diagram" visible |
| 10 | Verify Panel Controls | Assert buttons | Simulate, Execute, Fullscreen, Close |
| 11 | Click Simulate | Click simulate button | Simulation modal opens |
| 12 | Verify Modal | Check heading | "Strategy Simulation" visible |
| 13 | Verify Initial Capital | Check input | Editable textbox visible |
| 14 | Verify Timeframe | Check dropdown | Combobox visible |
| 15 | Click Initiate Backtest | Click button | Backtest starts |
| 16 | Wait for Results | Wait for tabs | Summary, Table, Chart tabs visible |
| 17 | Verify Summary Tab | Click and check content | ROI percentage visible |
| 18 | Verify Table Tab | Click and check content | Table or chart visible |
| 19 | Verify Chart Tab | Click and check content | Chart visible |

**Key Fixes (2026-01-30):**
- "Backtest" button renamed to "Simulate"
- Modal inputs use role-based selectors (no testids)
- `getInitialCapitalInput()`: `getByRole('textbox', { name: /initial capital/i })`
- `getTimeframeControl()`: `getByRole('combobox')` with option filter
- `getInitiateBacktestButton()`: `getByRole('button', { name: /initiate backtest/i })`

---

## Test Data Files

| File | Purpose |
|------|---------|
| `src/utils/testData/chatPrompts.ts` | Chat command prompts for testing |
| `src/utils/testData/walletAddresses.ts` | Valid wallet addresses for agent creation |
| `src/utils/testData/usedWalletAddresses.json` | Tracks used wallets (auto-updated) |
| `src/utils/testData/botWalletAddresses.ts` | Known bot/exchange wallets for error testing |

### Chat Prompts
```typescript
{
  scanTopPerforming30d: '/scan top performing token in 30d',
  analyzeTradeVolume: '/analyze trade volume, win rate, and top 5 holdings',
  buildPortfolio1k: '/build a $1K portfolio using MA crossover and sentiment signals',
}
```

---

## Page Objects Used

| Page Object | File |
|-------------|------|
| `AuthenticatedHeader` | `src/pages/AuthenticatedHeader.ts` |
| `CreditsPage` | `src/pages/CreditsPage.ts` |
| `PurchaseModal` | `src/pages/PurchaseModal.ts` |
| `ChatPage` | `src/pages/ChatPage.ts` |
| `AgentCreationFlow` | `src/pages/AgentCreationFlow.ts` |
| `MyAgentsPage` | `src/pages/MyAgentsPage.ts` |
| `AgentProfilePage` | `src/pages/AgentProfilePage.ts` |
| `StrategyBuilderPanel` | `src/pages/StrategyBuilderPanel.ts` |
| `HomePage` | `src/pages/HomePage.ts` |

---

## Configuration

- **Project**: `authenticated-tests`
- **Storage State**: `auth/google.json`
- **Base URL**: `https://aistg.walle.xyz`
- **Dependencies**: `setup-authenticated-tests` (runs `auth.setup.ts` first)

---

## Setup Requirements

### Authentication Refresh (`auth.setup.ts`)
Before running authenticated tests, the setup script:
1. Loads storage state from `auth/google.json`
2. Checks if access token is still valid
3. If expired, attempts to refresh using refresh token
4. Saves updated tokens back to `auth/google.json`

### Manual Auth Setup
If tokens are completely expired:
```bash
npx playwright test tests/auth/google.setup.ts --headed
```
Then manually log in with Google when browser opens.

---

## Known Limitations

1. **Credits Flow**: ThirdWeb deposit account setup cannot be automated
2. **Agent Creation**: Takes 60-120 seconds for agent processing
3. **Strategy Backtest**: Takes 30-60 seconds for backtest to complete
4. **Lazy Loading**: My Agents page images lazy-load, only first 5 cards checked

---

## Recent Healer Fixes (2026-01-30)

| Test | Issue | Fix |
|------|-------|-----|
| ChatSessionsFlow | Single-click opened profile page | Changed to double-click on agent card |
| MyAgentsFlow | Selector matched both cards and links | Added `:not([data-testid*="link"])` filter |
| MyAgentsFlow | Chat button had pointer-events-none | Changed to role-based button selector |
| StrategyBuilderBacktest | "Backtest" button renamed | Changed to "Simulate" |
| StrategyBuilderBacktest | Modal inputs have no testids | Changed to role-based selectors |

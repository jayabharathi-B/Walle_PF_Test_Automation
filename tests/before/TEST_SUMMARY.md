# Test Summary: Before Login Tests

> **Purpose**: Tests that run WITHOUT authentication (unauthenticated state)
> **Last Updated**: 2026-01-30
> **Test Project**: `before-login-tests` (configured in `playwright.config.ts`)

---

## Overview

These tests verify functionality available to users who have NOT logged in. They test:
- Connect wallet modal
- Homepage content and navigation
- Agent creation flow (pre-login)
- Wallet address validation
- Explore page interactions
- Leaderboard UI

---

## Test Files

### 1. BeforeLogin.spec.ts

#### Test: `verify connect wallet`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Connect wallet modal opens and displays correct elements |
| **Preconditions** | User is not logged in (state reset) |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reset state and open connect wallet modal | Modal opens |
| 2 | Assert "Connect to Continue" text | Text is visible |
| 3 | Assert connect wallet button | Button is enabled |
| 4 | Click "Connect a Wallet" option | Shows wallet providers |
| 5 | Assert back button | Back button visible |
| 6 | Assert "New to wallets?" text | Help text visible |

---

#### Test: `verify homepage content`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Homepage displays all key elements and CTA buttons work |
| **Preconditions** | User is not logged in |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reset state and reload page | Page loads |
| 2 | Wait for welcome text | "Welcome" heading visible |
| 3 | Assert "Create Your Agent" text | Text visible |
| 4 | Assert "Explore Agents" text | Text visible |
| 5 | Click "Scan Best Performers" button | Input populated with scan prompt |
| 6 | Click "Analyze Market Sentiment" button | Input populated with analyze prompt |
| 7 | Click "Build DeFi Strategies" button | Input populated with build prompt |
| 8 | Test plus button dropdown - "Read on-chain data" | Input shows "scan" |
| 9 | Test plus button dropdown - "Evaluate portfolio trends" | Input shows "analyze" |
| 10 | Test plus button dropdown - "Create trading strategies" | Input shows "build" |
| 11 | Assert deep analysis button | Button is enabled |

---

#### Test: `verify navigation bar links`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Navigation bar tooltips and navigation behavior |
| **Preconditions** | User is not logged in |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Hover each nav button (Dashboard, Leaderboard, My Agents, Chat) | Tooltip shows on hover |
| 2 | Move mouse away | Tooltip has opacity 0 |
| 3 | Go to My Agents | URL contains `/my-agents`, connect modal appears |
| 4 | Close modal, go home | Returns to homepage |
| 5 | Go to Chat | Either navigates to `/chat` with modal OR modal appears on homepage |
| 6 | Go to Dashboard | Stays on homepage (guarded) |
| 7 | Go to Leaderboard | URL contains `/leaderboard` |

---

#### Test: `verify create your agent before login`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Agent creation flow prompts signup when not logged in |
| **Preconditions** | User is not logged in |
| **Test Data** | Chain: `Ethereum`, Wallet: `0x8fCb871F786aac849410cD2b068DD252472CdAe9` |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reset state | Clean state |
| 2 | Create agent with chain and wallet | Triggers creation flow |
| 3 | Assert signup prompt | "Signup" prompt is visible |

---

#### Test: Wallet Validation Matrix (6 tests)
| Attribute | Details |
|-----------|---------|
| **What it tests** | Wallet address validation for different chains |
| **Preconditions** | User is not logged in |
| **Test Data** | From `walletTestData.ts` |

| Test Case | Chain | Input | Expects Inline Error | Expects Submit Blocked |
|-----------|-------|-------|---------------------|----------------------|
| Valid Ethereum (lowercase) | Ethereum | `0x8fcb871f786aac849410cd2b068dd252472cdae9` | No | No |
| Valid Ethereum (checksum) | Ethereum | `0x8fCb871F786aac849410cD2b068DD252472CdAe9` | No | No |
| Valid Solana | Solana | `4Nd1mKk1bCqDqX3z4hN6T6fZP1n7H9mZKX8h2Z` | No | No |
| Invalid ETH length | Ethereum | `0x123` | Yes | Yes |
| Solana address with Ethereum | Ethereum | `4Nd1mKk1...` | Yes | Yes |
| ETH address with Solana | Solana | `0x8fCb871F...` | Yes | Yes |

---

#### Test: `Chat agent guarded actions and back navigation`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Chat with agent is guarded and back navigation works |
| **Preconditions** | User is not logged in |
| **Test Data** | Randomly selected agent from explore |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reset state | Clean state |
| 2 | Select random agent for chat | Navigates to chat page |
| 3 | Verify agent heading (if visible) | Agent name shown |
| 4 | Click suggestion button | Connect modal may appear |
| 5 | Try to send message "hi" | Connect modal may appear |
| 6 | Go back | Returns to homepage |

---

#### Test: `Explore agents multi-select and guarded start chat flow`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Multi-agent selection (3-agent limit) and guarded chat start |
| **Preconditions** | User is not logged in |
| **Test Data** | None (uses first 3 agents in explore) |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reset state | Clean state |
| 2 | Select 1st agent | 1 avatar selected, action button disabled, text "Add Agent" |
| 3 | Select 2nd agent | 2 avatars selected, action button enabled, text "Start Chat" |
| 4 | Select 3rd agent | 3 avatars selected, action button enabled |
| 5 | Check 4th agent checkbox | Should be disabled (3-agent limit) |
| 6 | Click action button | Connect modal appears (guarded) |

---

#### Test: `Agent profile navigation works from explore page`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Clicking agent name navigates to profile, back returns to home |
| **Preconditions** | User is not logged in |
| **Test Data** | Randomly selected agent |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reset state | Clean state |
| 2 | Click random agent name | Navigates to agent profile |
| 3 | Verify profile name matches | Name is visible |
| 4 | Go back | Returns to homepage |

---

#### Test: `Explore page shows agents in all tabs`
| Attribute | Details |
|-----------|---------|
| **What it tests** | All explore tabs have agents loaded |
| **Preconditions** | User is not logged in |
| **Test Data** | Expected minimum: 15 agents per tab |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reset state | Clean state |
| 2 | Validate all tabs | Each tab has > 0 agents |

---

### 2. AgentSelectionFlow.spec.ts

#### Test: `STEP 1: verify homepage initial elements`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Homepage shows Add Agents button, chat input appears after adding agent |
| **Preconditions** | User is not logged in |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reset state | Clean state |
| 2 | Assert "Add Agents" button | Visible and enabled, text contains "Add Agents" |
| 3 | Open Quick Select modal | Modal opens |
| 4 | Select first agent | Agent selected |
| 5 | Close with "Add to Chat" | Modal closes |
| 6 | Assert chat input | Visible with placeholder |
| 7 | Clear input, assert send button | Send button disabled |

---

#### Test: `STEP 2: verify Quick Select modal opens with 5 agents`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Quick Select modal displays 5 OG agents |
| **Preconditions** | User is not logged in |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reset state | Clean state |
| 2 | Open Quick Select modal | Modal opens |
| 3 | Assert heading | Visible |
| 4 | Assert agent counter | Shows "0" |
| 5 | Assert agent cards | >= 5 cards visible |

---

#### Test: `STEP 2: verify Quick Select modal buttons and selection`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Quick Select buttons and checkbox selection works |
| **Preconditions** | User is not logged in |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reset state | Clean state |
| 2 | Open Quick Select modal | Modal opens |
| 3 | Assert "Add to Chat" button | Visible and enabled |
| 4 | Assert "Explore More Agents" button | Visible and enabled |
| 5 | Select first agent | Agent selected |
| 6 | Assert counter | Shows "1" |
| 7 | Assert deselect button | 1 deselect button exists |

---

#### Test: `STEP 3: verify agent thumbnail appears after ADD TO CHAT`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Agent thumbnail appears in chat bar after selection |
| **Preconditions** | User is not logged in |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reset state | Clean state |
| 2 | Open Quick Select, select agent | Agent selected |
| 3 | Click "Add to Chat" | Modal closes |
| 4 | Assert thumbnail count | 1 thumbnail visible |

---

#### Test: `STEP 4: verify Explore Agents modal opens and displays tabs`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Explore Agents modal has all tabs and agent cards |
| **Preconditions** | User is not logged in |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reset state | Clean state |
| 2 | Open Explore Agents modal | Modal opens |
| 3 | Assert heading | Visible |
| 4 | Assert all 5 tabs | Most Engaged, Recently Created, Top PnL, Most Followed, Top Score |
| 5 | Assert select buttons | Count > 0 |

---

#### Test: `STEP 4: verify Explore modal close button`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Close button closes Explore modal |
| **Preconditions** | User is not logged in |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reset state | Clean state |
| 2 | Open Explore Agents modal | Modal opens |
| 3 | Assert close button | Visible |
| 4 | Click close | Modal closes |
| 5 | Assert close button | Hidden |

---

#### Test: `STEP 5: verify selecting 2 different agents in Explore`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Can select agents from both Quick Select and Explore |
| **Preconditions** | User is not logged in |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reset state | Clean state |
| 2 | Open Quick Select, select 1 agent, close | 1 agent selected |
| 3 | Open Explore modal | Modal opens |
| 4 | Select 1 more agent | 2 total agents |
| 5 | Assert other agents still enabled | Can select more |

---

#### Test: `STEP 5: verify 3-agent limit disables remaining agents`
| Attribute | Details |
|-----------|---------|
| **What it tests** | 3-agent selection limit is enforced |
| **Preconditions** | User is not logged in |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reset state | Clean state |
| 2 | Open Quick Select, select 1 agent | 1 selected |
| 3 | Click "Explore More Agents" | Opens Explore modal |
| 4 | Select 2 more agents | 3 total selected |
| 5 | Add agents to chat | Modal closes |
| 6 | Assert thumbnail count | 3 thumbnails visible |

---

#### Test: `STEP 6: verify send button enabled and navigation`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Send button enables when input has text |
| **Preconditions** | User is not logged in |
| **Test Data** | Message: "scan wallet" |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reset state | Clean state |
| 2 | Add agent via Quick Select | Agent added |
| 3 | Type "scan wallet" | Text entered |
| 4 | Assert send button | Enabled |
| 5 | Click send | Message sent |
| 6 | Assert send button still visible | Action completed |

---

#### Test: `EDGE CASE: deselecting agent re-enables others` (SKIPPED)
| Attribute | Details |
|-----------|---------|
| **What it tests** | Deselecting an agent when at 3-agent limit re-enables selection |
| **Status** | SKIPPED |

---

#### Test: `EDGE CASE: verify switching tabs in Explore modal`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Tab switching works in Explore modal |
| **Preconditions** | User is not logged in |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reset state | Clean state |
| 2 | Open Explore modal | Modal opens |
| 3 | Assert "Most Engaged" tab | Active by default |
| 4 | Click "Top PnL" tab | Tab switches |
| 5 | Click "Top Score" tab | Tab switches |

---

### 3. LeaderboardTable.spec.ts

#### Test: `verify all 5 table column headers are visible`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Leaderboard table has all 5 column headers |
| **Preconditions** | User is not logged in |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reset state, wait for table | Table loads |
| 2 | Assert Rank header | Visible |
| 3 | Assert Agent Name header | Visible |
| 4 | Assert Agent Score header | Visible |
| 5 | Assert Trades header | Visible |
| 6 | Assert Chats header | Visible |

---

#### Test: `verify table loads with 20 agent rows`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Leaderboard loads exactly 20 rows |
| **Preconditions** | User is not logged in |
| **Test Data** | Expected: 20 rows |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reset state, wait for table | Table loads |
| 2 | Count agent rows | Exactly 20 rows |

---

#### Test: `verify first agent row has button element`
| Attribute | Details |
|-----------|---------|
| **What it tests** | First row exists and is clickable |
| **Preconditions** | User is not logged in |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reset state, wait for table | Table loads |
| 2 | Assert first row | Visible and enabled |

---

#### Test: `verify loading state completes before table visible`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Loading indicator disappears when table loads |
| **Preconditions** | User is not logged in |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to leaderboard | Page loads |
| 2 | Wait for table loaded | Loading completes |
| 3 | Assert leaderboard heading | Visible |

---

#### Tests: Header Sort Clickability (4 tests)
| Test | What it tests |
|------|--------------|
| `verify rank header is clickable for sorting` | Rank header click doesn't throw |
| `verify agent score header is clickable for sorting` | Score header click doesn't throw |
| `verify trades header is clickable for sorting` | Trades header click doesn't throw |
| `verify chats header is clickable for sorting` | Chats header click doesn't throw |

---

#### Tests: Data Column Content (3 tests)
| Test | Column | Assertion |
|------|--------|-----------|
| `verify first agent row has score value` | Score | Text is truthy |
| `verify first agent row has trades value` | Trades | Text is truthy |
| `verify first agent row has chats value` | Chats | Text is truthy |

---

#### Test: `verify headers remain visible after sort interaction`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Headers stay visible after sorting |
| **Preconditions** | User is not logged in |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reset state, wait for table | Table loads |
| 2 | Assert headers visible | All headers visible |
| 3 | Click rank sort | Sorted |
| 4 | Assert headers still visible | All 4 headers still visible |

---

#### Test: `verify connect wallet button is visible in leaderboard header`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Connect wallet button shown when not logged in |
| **Preconditions** | User is not logged in |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reset state | Clean state |
| 2 | Assert connect wallet button | Visible and enabled |

---

### 4. LeaderboardBubbles.spec.ts

#### Test: `verify bubbles of fame heading is visible`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Bubbles section heading is visible |
| **Preconditions** | User is not logged in, bubbles loaded |
| **Test Data** | None |

---

#### Test: `verify agent bubbles are present in the carousel`
| Attribute | Details |
|-----------|---------|
| **What it tests** | At least 1 bubble exists |
| **Preconditions** | User is not logged in, bubbles loaded |
| **Test Data** | None |

---

#### Test: `verify clicking a bubble opens agent detail panel with correct name`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Clicking bubble opens panel with matching agent name |
| **Preconditions** | User is not logged in, bubbles loaded |
| **Test Data** | First bubble |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Get first bubble image alt text | Agent name captured |
| 2 | Click first bubble | Panel opens |
| 3 | Assert panel visible | Visible |
| 4 | Assert name in panel | Contains expected name |

---

#### Test: `verify chat with agent button is visible and enabled in panel`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Chat button in agent panel works |
| **Preconditions** | User is not logged in, bubbles loaded |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click first bubble | Panel opens |
| 2 | Assert chat button | Visible and enabled |

---

#### Test: `verify clicking chat with agent navigates to chat page`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Chat button is clickable |
| **Preconditions** | User is not logged in, bubbles loaded |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click first bubble | Panel opens |
| 2 | Assert chat button | Visible and enabled |
| 3 | Click chat button | Action completes |

---

#### Test: `verify closing the agent detail panel`
| Attribute | Details |
|-----------|---------|
| **What it tests** | Panel can be closed |
| **Preconditions** | User is not logged in, bubbles loaded |
| **Test Data** | None |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click first bubble | Panel opens |
| 2 | Close panel | Panel hidden |

---

## Test Data Files

| File | Purpose |
|------|---------|
| `src/utils/testData/walletTestData.ts` | Wallet validation test cases (valid/invalid addresses) |

---

## Page Objects Used

| Page Object | File |
|-------------|------|
| `HomePage` | `src/pages/HomePage.ts` |
| `ConnectModal` | `src/pages/ConnectModal.ts` |
| `ExplorePage` | `src/pages/ExplorePage.ts` |
| `ChatPage` | `src/pages/ChatPage.ts` |
| `AgentProfilePage` | `src/pages/AgentProfilePage.ts` |
| `LeaderboardPage` | `src/pages/LeaderboardPage.ts` |
| `AgentSelectionPage` | `src/pages/AgentSelectionFlow.ts` |

---

## Configuration

- **Project**: `before-login-tests`
- **Storage State**: None (unauthenticated)
- **Base URL**: `https://aistg.walle.xyz`

import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ExplorePage } from '../pages/ExplorePage';
import { AgentProfilePage } from '../pages/AgentProfilePage';
import { ChatPage } from '../pages/ChatPage';
import { ConnectModal } from '../pages/ConnectModal';
import { LeaderboardPage } from '../pages/LeaderboardPage';
import { AgentSelectionFlow } from '../pages/AgentSelectionFlow';
import { AuthenticatedHeader } from '../pages/AuthenticatedHeader';
import { CreditsPage } from '../pages/CreditsPage';
import { PurchaseModal } from '../pages/PurchaseModal';
import { MyAgentsPage } from '../pages/MyAgentsPage';
import { StrategyBuilderPanel } from '../pages/StrategyBuilderPanel';

type Fixtures = {
  home: HomePage;
  explore: ExplorePage;
  agentProfile: AgentProfilePage;
  chat: ChatPage;
  connectModal: ConnectModal;
  leaderboard: LeaderboardPage;
  agentSelection: AgentSelectionFlow;
  authenticatedHeader: AuthenticatedHeader;
  creditsPage: CreditsPage;
  purchaseModal: PurchaseModal;
  myAgents: MyAgentsPage;
  strategyBuilder: StrategyBuilderPanel;
};

export const test = base.extend<Fixtures>({
  home: async ({ page }, use) => {
    const home = new HomePage(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await use(home);
  },

  explore: async ({ page }, use) => {
    const explore = new ExplorePage(page);
    await use(explore);
  },

  agentProfile: async ({ page }, use) => {
    const agentProfile = new AgentProfilePage(page);
    await use(agentProfile);
  },

  chat: async ({ page }, use) => {
    const chat = new ChatPage(page);
    await use(chat);
  },

  connectModal: async ({ page }, use) => {
    const connectModal = new ConnectModal(page);
    await use(connectModal);
  },

  leaderboard: async ({ page }, use) => {
    const leaderboard = new LeaderboardPage(page);
    await page.goto('/leaderboard', { waitUntil: 'domcontentloaded' });
    await use(leaderboard);
  },

  agentSelection: async ({ page }, use) => {
    const agentSelection = new AgentSelectionFlow(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await use(agentSelection);
  },

  authenticatedHeader: async ({ page }, use) => {
    const authenticatedHeader = new AuthenticatedHeader(page);
    await use(authenticatedHeader);
  },

  creditsPage: async ({ page }, use) => {
    const creditsPage = new CreditsPage(page);
    await use(creditsPage);
  },

  purchaseModal: async ({ page }, use) => {
    const purchaseModal = new PurchaseModal(page);
    await use(purchaseModal);
  },

  myAgents: async ({ page }, use) => {
    const myAgents = new MyAgentsPage(page);
    await use(myAgents);
  },

  strategyBuilder: async ({ page }, use) => {
    const strategyBuilder = new StrategyBuilderPanel(page);
    await use(strategyBuilder);
  },
});

export { expect } from '@playwright/test';

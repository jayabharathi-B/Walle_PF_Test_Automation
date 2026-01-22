export const chatPrompts = {
  scanTopPerforming30d: '/scan top performing token in 30d',
  analyzeTradeVolume: '/analyze trade volume, win rate, and top 5 holdings',
  buildPortfolio1k: '/build a $1K portfolio using MA crossover and sentiment signals',
} as const;

export const chatPromptList = Object.values(chatPrompts);

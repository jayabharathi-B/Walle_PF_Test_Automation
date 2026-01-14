export type WalletTestCase = {
  title: string;
  chain: 'Ethereum' | 'Solana';
  input: string;
  expectsInlineError?: boolean;
  expectsSubmitBlocked?: boolean;
};

export const walletTestCases: WalletTestCase[] = [
  {
    title: 'Valid Ethereum (lowercase)',
    chain: 'Ethereum',
    input: '0x8fcb871f786aac849410cd2b068dd252472cdae9',
  },
  {
    title: 'Valid Ethereum (checksum)',
    chain: 'Ethereum',
    input: '0x8fCb871F786aac849410cD2b068DD252472CdAe9',
  },
  {
    title: 'Valid Solana',
    chain: 'Solana',
    input: '4Nd1mKk1bCqDqX3z4hN6T6fZP1n7H9mZKX8h2Z',
  },
  {
    title: 'Invalid ETH length',
    chain: 'Ethereum',
    input: '0x123',
    expectsInlineError: true,
    expectsSubmitBlocked: true,
  },
  {
    title: 'Solana address with Ethereum selected',
    chain: 'Ethereum',
    input: '4Nd1mKk1bCqDqX3z4hN6T6fZP1n7H9mZKX8h2Z',
    expectsInlineError: true,
    expectsSubmitBlocked: true,
  },
  {
    title: 'ETH address with Solana selected',
    chain: 'Solana',
    input: '0x8fCb871F786aac849410cD2b068DD252472CdAe9',
    expectsInlineError: true,
    expectsSubmitBlocked: true,
  },
];

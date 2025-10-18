// TypeScript types for Avail Nexus SDK responses (actual format from SDK)

export interface ChainInfo {
  id: number;
  logo: string;
  name: string;
}

export interface BalanceBreakdown {
  balance: string;
  balanceInFiat: number;
  chain: ChainInfo;
  contractAddress: string;
  decimals: number;
  universe: number;
}

export interface TokenBalance {
  abstracted: boolean;
  balance: string;
  balanceInFiat: number;
  breakdown: BalanceBreakdown[];
  decimals: number;
  icon: string;
  symbol: string;
}

// SDK returns an array of TokenBalance
export type UnifiedBalances = TokenBalance[];

export interface ParsedBalance {
  chain: string;
  chainId: number;
  chainLogo: string;
  token: string;
  tokenIcon: string;
  balance: string;
  balanceFormatted: string;
  balanceInFiat: number;
  contractAddress: string;
  decimals: number;
}

export interface ChainMetadata {
  name: string;
  displayName: string;
  logoUrl: string;
  nativeToken: string;
  explorerUrl: string;
}

export interface BalanceSummary {
  totalChains: number;
  totalTokens: number;
  totalValueUSD: number;
  balancesByChain: Map<string, ParsedBalance[]>;
  balancesByToken: Map<string, ParsedBalance[]>;
}

export type TransferStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface Transfer {
  transferId: string;
  fromChain: string;
  toChain: string;
  token: string;
  amount: string;
  recipient: string;
  status: TransferStatus;
  txHash?: string;
  estimatedTime?: number;
  createdAt: number;
}

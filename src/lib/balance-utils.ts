// Utility functions for processing and formatting balance data

import { UnifiedBalances, ParsedBalance, ChainMetadata } from '@/types/nexus';

// Chain metadata configuration
export const CHAIN_METADATA: Record<string, ChainMetadata> = {
  ethereum: {
    name: 'ethereum',
    displayName: 'Ethereum',
    logoUrl: '⟠', // Emoji placeholder, replace with actual logo URL
    nativeToken: 'ETH',
    explorerUrl: 'https://etherscan.io',
  },
  arbitrum: {
    name: 'arbitrum',
    displayName: 'Arbitrum',
    logoUrl: '🔷',
    nativeToken: 'ETH',
    explorerUrl: 'https://arbiscan.io',
  },
  optimism: {
    name: 'optimism',
    displayName: 'Optimism',
    logoUrl: '🔴',
    nativeToken: 'ETH',
    explorerUrl: 'https://optimistic.etherscan.io',
  },
  base: {
    name: 'base',
    displayName: 'Base',
    logoUrl: '🔵',
    nativeToken: 'ETH',
    explorerUrl: 'https://basescan.org',
  },
  polygon: {
    name: 'polygon',
    displayName: 'Polygon',
    logoUrl: '🟣',
    nativeToken: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
  },
};

/**
 * Format balance string to fixed decimal places
 * @param balance - Raw balance string
 * @param decimals - Number of decimal places (default: 4)
 * @returns Formatted balance string
 */
export function formatBalance(balance: string, decimals: number = 4): string {
  const num = parseFloat(balance);
  if (isNaN(num)) return '0';

  // For very small numbers, use more precision
  if (num < 0.0001 && num > 0) {
    return num.toExponential(2);
  }

  return num.toFixed(decimals);
}

/**
 * Parse unified balances from Nexus SDK into structured array
 * @param unifiedBalances - Array of token balances from SDK
 * @returns Array of parsed balances with chain breakdown
 */
export function parseUnifiedBalances(unifiedBalances: UnifiedBalances): ParsedBalance[] {
  const parsed: ParsedBalance[] = [];

  if (!Array.isArray(unifiedBalances)) {
    console.error('Expected unifiedBalances to be an array');
    return parsed;
  }

  unifiedBalances.forEach((tokenBalance) => {
    tokenBalance.breakdown.forEach((breakdown) => {
      // Only include balances > 0
      if (parseFloat(breakdown.balance) > 0) {
        parsed.push({
          chain: breakdown.chain.name,
          chainId: breakdown.chain.id,
          chainLogo: breakdown.chain.logo,
          token: tokenBalance.symbol,
          tokenIcon: tokenBalance.icon,
          balance: breakdown.balance,
          balanceFormatted: formatBalance(breakdown.balance),
          balanceInFiat: breakdown.balanceInFiat,
          contractAddress: breakdown.contractAddress,
          decimals: breakdown.decimals,
        });
      }
    });
  });

  return parsed;
}

/**
 * Group balances by chain
 * @param balances - Array of parsed balances
 * @returns Map of chain name to balances (sorted by total value)
 */
export function groupByChain(balances: ParsedBalance[]): Map<string, ParsedBalance[]> {
  const grouped = new Map<string, ParsedBalance[]>();

  balances.forEach((balance) => {
    const existing = grouped.get(balance.chain) || [];
    grouped.set(balance.chain, [...existing, balance]);
  });

  // Sort chains by total value
  return new Map(
    Array.from(grouped.entries()).sort(([, a], [, b]) => {
      const totalA = a.reduce((sum, bal) => sum + bal.balanceInFiat, 0);
      const totalB = b.reduce((sum, bal) => sum + bal.balanceInFiat, 0);
      return totalB - totalA;
    })
  );
}

/**
 * Group balances by token
 * @param balances - Array of parsed balances
 * @returns Map of token symbol to balances
 */
export function groupByToken(balances: ParsedBalance[]): Map<string, ParsedBalance[]> {
  const grouped = new Map<string, ParsedBalance[]>();

  balances.forEach((balance) => {
    const existing = grouped.get(balance.token) || [];
    grouped.set(balance.token, [...existing, balance]);
  });

  return grouped;
}

/**
 * Find chains with the most balance for a specific token
 * @param balances - Array of parsed balances
 * @param token - Token symbol to search for
 * @returns Sorted array of balances (highest first)
 */
export function findBestSourcesForToken(
  balances: ParsedBalance[],
  token: string
): ParsedBalance[] {
  return balances
    .filter((b) => b.token === token)
    .sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
}

/**
 * Calculate total balance for a token across all chains
 * @param balances - Array of parsed balances
 * @param token - Token symbol
 * @returns Total balance
 */
export function getTotalBalanceForToken(balances: ParsedBalance[], token: string): number {
  return balances
    .filter((b) => b.token === token)
    .reduce((sum, b) => sum + parseFloat(b.balance), 0);
}

/**
 * Get unique list of chains from balances
 * @param balances - Array of parsed balances
 * @returns Array of unique chain names
 */
export function getUniqueChains(balances: ParsedBalance[]): string[] {
  return Array.from(new Set(balances.map((b) => b.chain)));
}

/**
 * Get unique list of tokens from balances
 * @param balances - Array of parsed balances
 * @returns Array of unique token symbols
 */
export function getUniqueTokens(balances: ParsedBalance[]): string[] {
  return Array.from(new Set(balances.map((b) => b.token)));
}

/**
 * Check if balance is significant (above threshold)
 * @param balance - Balance string
 * @param threshold - Minimum threshold (default: 0.0001)
 * @returns True if balance is above threshold
 */
export function isSignificantBalance(balance: string, threshold: number = 0.0001): boolean {
  return parseFloat(balance) >= threshold;
}

/**
 * Get chain display name and metadata
 * @param chainName - Chain identifier
 * @returns Chain metadata or default
 */
export function getChainMetadata(chainName: string): ChainMetadata {
  return CHAIN_METADATA[chainName.toLowerCase()] || {
    name: chainName,
    displayName: chainName.charAt(0).toUpperCase() + chainName.slice(1),
    logoUrl: '⛓️',
    nativeToken: 'ETH',
    explorerUrl: '#',
  };
}

/**
 * Calculate total USD value of all balances
 * @param balances - Array of parsed balances
 * @returns Total USD value
 */
export function getTotalValueUSD(balances: ParsedBalance[]): number {
  return balances.reduce((sum, b) => sum + b.balanceInFiat, 0);
}

/**
 * Format USD value
 * @param value - USD value
 * @returns Formatted string
 */
export function formatUSD(value: number): string {
  if (value < 0.01 && value > 0) {
    return '< $0.01';
  }
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

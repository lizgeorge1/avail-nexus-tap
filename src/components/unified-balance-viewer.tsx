'use client';

import { useMemo, useState } from 'react';
import { UnifiedBalances, ParsedBalance } from '@/types/nexus';
import {
  parseUnifiedBalances,
  groupByChain,
  groupByToken,
  isSignificantBalance,
  getUniqueChains,
  getUniqueTokens,
  getTotalValueUSD,
  formatUSD,
} from '@/lib/balance-utils';

interface UnifiedBalanceViewerProps {
  balances: UnifiedBalances | null;
  className?: string;
}

export default function UnifiedBalanceViewer({ balances, className }: UnifiedBalanceViewerProps) {
  const [viewMode, setViewMode] = useState<'chain' | 'token'>('chain');
  const [showOnlySignificant, setShowOnlySignificant] = useState(true);

  const parsedBalances = useMemo(() => {
    if (!balances) return [];
    const parsed = parseUnifiedBalances(balances);

    if (showOnlySignificant) {
      return parsed.filter((b) => isSignificantBalance(b.balance));
    }

    return parsed;
  }, [balances, showOnlySignificant]);

  const balancesByChain = useMemo(() => groupByChain(parsedBalances), [parsedBalances]);
  const balancesByToken = useMemo(() => groupByToken(parsedBalances), [parsedBalances]);

  const uniqueChains = useMemo(() => getUniqueChains(parsedBalances), [parsedBalances]);
  const uniqueTokens = useMemo(() => getUniqueTokens(parsedBalances), [parsedBalances]);
  const totalValueUSD = useMemo(() => getTotalValueUSD(parsedBalances), [parsedBalances]);

  if (!balances) {
    return (
      <div className={`p-6 border border-gray-700 rounded-lg bg-gray-800/50 ${className}`}>
        <p className="text-gray-400 text-center">
          No balances to display. Connect wallet and initialize SDK first.
        </p>
      </div>
    );
  }

  if (parsedBalances.length === 0) {
    return (
      <div className={`p-6 border border-gray-700 rounded-lg bg-gray-800/50 ${className}`}>
        <p className="text-gray-400 text-center">
          No significant balances found. {showOnlySignificant && 'Try unchecking the filter.'}
        </p>
      </div>
    );
  }

  return (
    <div className={`p-6 border border-gray-700 rounded-lg bg-gray-800/50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Cross-Chain Portfolio</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('chain')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'chain'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            By Chain
          </button>
          <button
            onClick={() => setViewMode('token')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'token'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            By Token
          </button>
          <details className="relative">
            <summary className="px-3 py-1 rounded-md text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 cursor-pointer transition-colors">
              Raw JSON
            </summary>
            <div className="absolute right-0 top-full mt-2 w-96 max-h-96 overflow-auto bg-gray-900 border border-gray-600 rounded-lg shadow-xl z-10">
              <pre className="p-4 text-xs text-gray-300">
                {JSON.stringify(balances, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-700/50 rounded-lg">
          <p className="text-gray-400 text-sm">Total Chains</p>
          <p className="text-2xl font-bold text-white">{uniqueChains.length}</p>
        </div>
        <div className="p-4 bg-gray-700/50 rounded-lg">
          <p className="text-gray-400 text-sm">Total Tokens</p>
          <p className="text-2xl font-bold text-white">{uniqueTokens.length}</p>
        </div>
        <div className="p-4 bg-gray-700/50 rounded-lg">
          <p className="text-gray-400 text-sm">Total Value</p>
          <p className="text-2xl font-bold text-green-400">{formatUSD(totalValueUSD)}</p>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="checkbox"
          id="showSignificant"
          checked={showOnlySignificant}
          onChange={(e) => setShowOnlySignificant(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="showSignificant" className="text-sm text-gray-300">
          Show only significant balances (&gt; 0.0001)
        </label>
      </div>

      {/* Balances Display */}
      <div className="space-y-4">
        {viewMode === 'chain' ? (
          // Group by Chain View
          Array.from(balancesByChain.entries()).map(([chain, chainBalances]) => {
            const totalChainValue = chainBalances.reduce((sum, b) => sum + b.balanceInFiat, 0);

            return (
              <div key={chain} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {chainBalances[0].chainLogo && (
                      <img
                        src={chainBalances[0].chainLogo}
                        alt={chain}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">{chain}</h3>
                      <p className="text-xs text-gray-400">Chain ID: {chainBalances[0].chainId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Total Value</p>
                    <p className="text-lg font-bold text-green-400">{formatUSD(totalChainValue)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {chainBalances.map((balance, idx) => (
                    <BalanceRow key={`${chain}-${balance.token}-${idx}`} balance={balance} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          // Group by Token View
          Array.from(balancesByToken.entries()).map(([token, tokenBalances]) => {
            const total = tokenBalances.reduce((sum, b) => sum + parseFloat(b.balance), 0);
            const totalValue = tokenBalances.reduce((sum, b) => sum + b.balanceInFiat, 0);

            return (
              <div key={token} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {tokenBalances[0].tokenIcon && (
                      <img
                        src={tokenBalances[0].tokenIcon}
                        alt={token}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">{token}</h3>
                      <p className="text-xs text-gray-400">Total: {total.toFixed(6)}</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-green-400">{formatUSD(totalValue)}</p>
                </div>
                <div className="space-y-2">
                  {tokenBalances.map((balance, idx) => (
                    <div
                      key={`${token}-${balance.chain}-${idx}`}
                      className="flex items-center justify-between p-2 bg-gray-800/50 rounded hover:bg-gray-800/70 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {balance.chainLogo && (
                          <img src={balance.chainLogo} alt={balance.chain} className="w-6 h-6 rounded-full" />
                        )}
                        <span className="text-gray-300">{balance.chain}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-mono">{balance.balanceFormatted}</p>
                        <p className="text-xs text-gray-400">{formatUSD(balance.balanceInFiat)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Helper component for displaying individual balance row
function BalanceRow({ balance }: { balance: ParsedBalance }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded hover:bg-gray-800/70 transition-colors">
      <div className="flex items-center gap-3">
        {balance.tokenIcon && (
          <img src={balance.tokenIcon} alt={balance.token} className="w-6 h-6 rounded-full" />
        )}
        <div>
          <p className="text-gray-300 font-medium">{balance.token}</p>
          <p className="text-xs text-gray-500">
            {balance.contractAddress === '0x0000000000000000000000000000000000000000'
              ? 'Native Token'
              : `${balance.contractAddress.slice(0, 6)}...${balance.contractAddress.slice(-4)}`}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-white font-mono">{balance.balanceFormatted}</p>
        <p className="text-sm text-green-400">{formatUSD(balance.balanceInFiat)}</p>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { simulateBridge, executeBridge } from '@/lib/nexus';
import type { BridgeParams, SUPPORTED_TOKENS } from '@/types/nexus';

interface BridgeWidgetProps {
  className?: string;
  availableBalances?: any; // Pass from parent to show available balance
}

export default function BridgeWidget({ className = '', availableBalances }: BridgeWidgetProps) {
  const [token, setToken] = useState<SUPPORTED_TOKENS>('ETH');
  const [amount, setAmount] = useState('');
  const [destinationChainId, setDestinationChainId] = useState('11155111'); // Ethereum Sepolia testnet
  const [simulation, setSimulation] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isBridging, setIsBridging] = useState(false);
  const [bridgeResult, setBridgeResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Testnet chain IDs (matching SDK testnet mode)
  const chains = [
    { id: 11155111, name: 'Ethereum Sepolia' },
    { id: 84532, name: 'Base Sepolia' },
    { id: 80002, name: 'Polygon Amoy' },
    { id: 421614, name: 'Arbitrum Sepolia' },
    { id: 11155420, name: 'Optimism Sepolia' },
  ];

  const tokens: SUPPORTED_TOKENS[] = ['ETH', 'USDC', 'USDT'];

  const handleSimulate = async () => {
    try {
      setError(null);
      setSimulation(null);
      setIsSimulating(true);

      const params: BridgeParams = {
        token,
        amount,
        chainId: parseInt(destinationChainId),
      };

      const result = await simulateBridge(params);
      setSimulation(result);
    } catch (err: any) {
      setError(err.message || 'Failed to simulate bridge');
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleBridge = async () => {
    try {
      setError(null);
      setBridgeResult(null);
      setIsBridging(true);

      const params: BridgeParams = {
        token,
        amount,
        chainId: parseInt(destinationChainId),
      };

      const result = await executeBridge(params);
      setBridgeResult(result);

      // Clear form on success
      if (result.success) {
        setAmount('');
        setSimulation(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to execute bridge');
      console.error('Bridge error:', err);
    } finally {
      setIsBridging(false);
    }
  };

  return (
    <div className={`bg-gray-800/50 border border-gray-700 rounded-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-white mb-4">🌉 Bridge Tokens</h2>
      <p className="text-gray-400 text-sm mb-6">
        Bridge tokens from multiple source chains to your destination chain
      </p>

      {/* Bridge Form */}
      <div className="space-y-4">
        {/* Token Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Token
          </label>
          <select
            value={token}
            onChange={(e) => setToken(e.target.value as SUPPORTED_TOKENS)}
            className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {tokens.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount
          </label>
          <input
            type="number"
            step="0.000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Destination Chain */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Destination Chain
          </label>
          <select
            value={destinationChainId}
            onChange={(e) => setDestinationChainId(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {chains.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleSimulate}
            disabled={!amount || isSimulating}
            className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSimulating ? '⏳ Simulating...' : '🔍 Preview Bridge'}
          </button>
          <button
            onClick={handleBridge}
            disabled={!amount || isBridging}
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isBridging ? '⏳ Bridging...' : '🚀 Execute Bridge'}
          </button>
        </div>
      </div>

      {/* Simulation Results */}
      {simulation && (
        <div className="mt-6 p-4 bg-gray-900/50 border border-purple-500/30 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-400 mb-3">
            💡 Simulation Results
          </h3>
          <div className="space-y-2 text-sm">
            {simulation.estimatedGas && (
              <div className="flex justify-between">
                <span className="text-gray-400">Estimated Gas:</span>
                <span className="text-white font-mono">{simulation.estimatedGas}</span>
              </div>
            )}
            {simulation.estimatedTime && (
              <div className="flex justify-between">
                <span className="text-gray-400">Estimated Time:</span>
                <span className="text-white">{simulation.estimatedTime}</span>
              </div>
            )}
            {simulation.totalCost && (
              <div className="flex justify-between">
                <span className="text-gray-400">Total Cost:</span>
                <span className="text-white font-mono">{simulation.totalCost}</span>
              </div>
            )}
            {simulation.route && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-gray-400 mb-1">Route:</p>
                <p className="text-white text-xs">
                  {simulation.route.sourceChain} → {simulation.route.destinationChain}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {simulation.route.amount} {simulation.route.token}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bridge Result */}
      {bridgeResult && (
        <div
          className={`mt-6 p-4 rounded-lg border ${
            bridgeResult.success
              ? 'bg-green-900/20 border-green-500/30'
              : 'bg-red-900/20 border-red-500/30'
          }`}
        >
          <h3
            className={`text-lg font-semibold mb-2 ${
              bridgeResult.success ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {bridgeResult.success ? '✅ Bridge Successful!' : '❌ Bridge Failed'}
          </h3>
          {bridgeResult.success ? (
            <div className="space-y-2">
              {bridgeResult.transactionHash && (
                <div className="text-sm">
                  <span className="text-gray-400">Transaction Hash:</span>
                  <code className="block text-green-300 font-mono text-xs mt-1 break-all">
                    {bridgeResult.transactionHash}
                  </code>
                </div>
              )}
              {bridgeResult.explorerUrl && (
                <a
                  href={bridgeResult.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  View on Explorer →
                </a>
              )}
            </div>
          ) : (
            <p className="text-red-300 text-sm">{bridgeResult.error}</p>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-900/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-gray-400">
          <strong className="text-blue-400">How it works:</strong> The SDK will automatically
          select the best source chain(s) that have sufficient balance to bridge your tokens to
          the destination chain. If you have funds scattered across multiple chains, it can
          aggregate them!
        </p>
      </div>
    </div>
  );
}

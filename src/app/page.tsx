'use client';

import { useState, useEffect } from 'react';
import ConnectButton from '@/components/connect-button';
import InitButton from '@/components/init-button';
import FetchUnifiedBalanceButton from '@/components/fetch-unified-balance-button';
import DeinitButton from '@/components/de-init-button';
import UnifiedBalanceViewer from '@/components/unified-balance-viewer';
import { isInitialized } from '@/lib/nexus';

export default function Page() {
  const [initialized, setInitialized] = useState(isInitialized());
  const [balances, setBalances] = useState<any>(null);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window === 'undefined') return;

      const eth = (window as any)?.ethereum;
      if (eth) {
        try {
          const accounts = await eth.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setConnectedAddress(accounts[0]);
          }
        } catch (error) {
          console.error('Failed to check wallet connection:', error);
        }
      }
    };
    checkConnection();
  }, []);

  const btn =
    'px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed transition-all';

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Avail Nexus SDK Demo
          </h1>
          <p className="text-gray-400">
            Cross-chain balance viewer and refuel toolkit
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <ConnectButton
              className={btn}
              onConnect={(address) => setConnectedAddress(address)}
            />
            <InitButton className={btn} onReady={() => setInitialized(true)} />
            <FetchUnifiedBalanceButton className={btn} onResult={(r) => setBalances(r)} />
            <DeinitButton
              className={btn}
              onDone={() => {
                setInitialized(false);
                setBalances(null);
              }}
            />
          </div>

          {/* Status Indicators */}
          <div className="pt-4 border-t border-gray-700 space-y-2">
            {/* Wallet Address */}
            {connectedAddress && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-gray-400">Connected:</span>
                <code className="text-xs bg-gray-900 px-2 py-1 rounded text-green-400 font-mono">
                  {`${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`}
                </code>
              </div>
            )}

            {/* SDK Status */}
            <div className="flex items-center justify-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  initialized ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                }`}
              />
              <span className="text-sm text-gray-300">
                SDK Status: <span className="font-semibold text-white">
                  {initialized ? 'Initialized' : 'Not Initialized'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Balance Viewer */}
        <UnifiedBalanceViewer balances={balances} className="mb-6" />

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>ETHOnline 2025 Hackathon • Avail Nexus Integration</p>
        </div>
      </div>
    </main>
  );
}

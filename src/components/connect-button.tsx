'use client';

interface ConnectButtonProps {
  className?: string;
  onConnect?: (address: string) => void;
}

export default function ConnectButton({ className, onConnect }: ConnectButtonProps) {
  const onClick = async () => {
    const eth = (window as any)?.ethereum;
    if (!eth) return alert('Install an EIP-1193 wallet (e.g., MetaMask)');

    try {
      const accounts = await eth.request?.({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        onConnect?.(accounts[0]);
        alert(`Wallet connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
      }
    } catch (error: any) {
      alert(`Connection failed: ${error.message}`);
    }
  };

  return (
    <button className={className} onClick={onClick}>
      Connect Wallet
    </button>
  );
}

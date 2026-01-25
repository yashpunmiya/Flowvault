"use client";

import { useWallet } from "@/context/WalletContext";

export function WalletConnect() {
  const { wallet, connectWallet, disconnectWallet, isLoading } = useWallet();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (wallet.isConnected && wallet.stxAddress) {
    return (
      <div className="flex items-center gap-3">
        <div className="glass-panel px-4 py-2 rounded-xl text-sm font-mono text-white/90 border-primary/20 bg-primary/5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00D67D] animate-pulse" />
          {truncateAddress(wallet.stxAddress)}
        </div>
        <button
          onClick={disconnectWallet}
          className="px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isLoading}
      className="btn-primary"
    >
      {isLoading ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
